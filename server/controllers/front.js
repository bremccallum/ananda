var Q = require('q'),
    moment = require("moment"),
    mongoose = require("mongoose-q")(),
    Posts = mongoose.model('Post'),
    Pages = mongoose.model('Page');

function Workshop(mboWorkshop) {
    this.id = mboWorkshop.ClassDescription.ID;
    this.date = mboWorkshop.StartDateTime;
    this.name = mboWorkshop.ClassDescription.Name;
    this.desc = mboWorkshop.ClassDescription.Description;
    return this;
}

module.exports = function (soap) {
    var Classes = soap.Classes,
        Staff = soap.Staff,
        SArgs = soap.setArgs;

    function home(req, res) {
        var now = moment();
        if (now.add('minutes', -30).day() != moment().day())
            now.add('minutes', 30);
        var tmrw = moment(now).add('days', 1).endOf('day');
        var args = SArgs({
            Fields: [
                {
                    string: 'Classes.ClassDescription.Name'
                },
                {
                    string: 'Classes.StartDateTime'
                },
                {
                    string: 'Classes.Staff.Name'
                }
            ],
            StartDateTime: now.format(soap.DateFormat),
            EndDateTime: tmrw.format(soap.DateFormat),
            SchedulingWindow: true,
            XMLDetail: 'Bare'
        });
        var workshopArgs = SArgs({
            Fields: [
                {
                    string: 'Classes.ClassDescription.Name'
                },
                {
                    string: 'Classes.StartDateTime'
                },
                {
                    string: 'Classes.Staff.Name'
                }
            ],
            StartDateTime: now.format(soap.DateFormat),
            EndDateTime: moment(tmrw).add('months', 2).format(soap.DateFormat),
            SchedulingWindow: true,
            ProgramIDs: [
                {
                    int: 27
                }
            ],
            XMLDetail: 'Bare'
        });
        var postQuery = Posts.find({
            isPublished: true
        }).select('title body published slug headerImg').sort({
            'published': -1
        }).limit(4);
        var pageQuery = Pages.findOne({
            page: "home"
        });
        //get classes
        //TODO: Is two requests really faster than one giant request?
        Q.all([
            Classes.GetClassesQ(args),
            Classes.GetClassesQ(workshopArgs),
            postQuery.execQ(),
            pageQuery.execQ()
        ])
            .spread(function (classes, workshops, posts, page) {
                classes = soap.cleanClasses(classes);
                var model = {};
                model.page = page;
                model.posts = posts;
                model.workshops = (function () {
                    var result = {};
                    soap.cleanClasses(workshops).forEach(function (ws) {
                        ws = new Workshop(ws);
                        var month = moment(ws.date).format('MMMM');
                        if (!result[month]) {
                            result[month] = [];
                        }
                        if (result[month].indexOf(ws.name) == -1) {
                            result[month].push(ws.name);
                        }
                    });
                    return result;
                })()
                var tmrwStart = tmrw.startOf('day');
                model.today = classes.filter(function (ele) {
                    var d = moment(ele.StartDateTime);
                    return d.isBefore(tmrwStart);
                });
                model.tmrw = classes.filter(function (ele) {
                    return moment(ele.StartDateTime).isAfter(moment(now).endOf('day'));
                });
                model.pm = (model.today[0] ? moment(model.today[0].StartDateTime).hours() : now.hours()) >= 16;

                res.render('home.html', model);
            }).fail(function (err) {
                console.error(err);
                res.redirect("/error");
            });
    }

    function instructors(req, res) {
        var args = {
            Fields: [
                {
                    string: 'Staff.Bio'
                },
                {
                    string: 'Staff.ImageURL'
                },
                {
                    string: 'Staff.Email'
                },
                {
                    string: 'Staff.Name'
                }
            ],
            XMLDetail: 'Bare'
        };
        Staff.GetStaffQ(SArgs(args))
            .then(function (staff) {
                staff = staff.GetStaffResult.StaffMembers.Staff
                    .filter(function (staff) {
                        return staff.ID > 1; //they have weird testing data at lower ID
                    });
                staff.map(function (s, i) { //clear empty Bio's
                    s.Bio = (typeof s.Bio == 'object') ? '' : s.Bio;
                });
                var model = {};
                model.staff = staff;
                model.title = "Instructors";
                res.render('instructors.html', model)
            }).fail(function (err) {
                console.error(err);
                res.redirect("/error");
            });
    }

    function classes(req, res) {
        var args = {
            XMLDetail: 'Bare',
            ProgramIDs: [
                {
                    int: 22 //Dropins
                }
            ],
            Fields: [
                {
                    string: 'ClassDescriptions.ImageURL'
                },
                {
                    string: 'ClassDescriptions.Name'
                },
                {
                    string: 'ClassDescriptions.Description'
                }
            ]
        };
        Classes.GetClassDescriptionsQ(SArgs(args))
            .then(function (classes) {
                classes = classes.GetClassDescriptionsResult.ClassDescriptions.ClassDescription;
                classes.map(function (o, i) {
                    o.Description = (typeof o.Description == 'object') ? '' : o.Description;
                });
                res.render('classes.html', {
                    title: "Classes",
                    classes: classes
                });
            }).fail(function (err) {
                console.error(err);
                res.redirect("/error");
            });
    }

    function schedule(req, res) {
        var now = moment();
        var future = moment().add('weeks', 2)
        var args = {
            StartDateTime: now.format(soap.DateFormat),
            EndDateTime: future.format(soap.DateFormat),
            SchedulingWindow: true,
            XMLDetail: 'Bare',
            Fields: [
                {
                    string: 'Classes.Staff.Name'
                },
                {
                    string: 'Classes.ClassDescription.Name'
                },
                {
                    string: 'Classes.StartDateTime'
                },
                {
                    string: 'Classes.EndDateTime'
                }
            ]
        };
        Classes.GetClassesQ(SArgs(args))
            .then(function (classes) {
                var model = {
                    classes: {},
                    days: []
                };
                for (var i = 0; i <= future.diff(now, 'days'); i++) {
                    var m = moment(now).add('days', i).format("dddd [the] Do");
                    model.days.push(m);
                    model.classes[m] = [];
                }
                classes.GetClassesResult.Classes.Class.forEach(function (c) {
                    model.classes[moment(c.StartDateTime).format("dddd [the] Do")].push(c);
                });
                model.title = "Schedule";
                res.render("schedule.html", model);
            }).fail(function (err) {
                console.error(err);
                res.redirect("/error");
            });
    }

    function viewPost(req, res) {
        Posts.findOne({
            slug: req.params.slug
        }, function (err, post) {
            var model = {
                title: post.title,
                post: post
            };
            res.render("news.html", model);
        })
    }

    //exports
    var out = {};
    out.home = home;
    out.instructors = instructors;
    out.classes = classes;
    out.schedule = schedule;
    out.viewPost = viewPost;
    return out;
}
