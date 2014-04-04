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



function Error(req, res) {
    res.statusCode = 500;
    res.render("error.html", {
        code: 500,
        message: "That means somethings go wrong on our side - sorry about that. We'll strive to get things working again ASAP!"
    });
}

module.exports = function (soap) {
    var Classes = soap.Classes,
        Staff = soap.Staff,
        SArgs = soap.setArgs;

    // ## Soap Argument Builders
    function workshopArgs(start, end, details) {
        var workshopArgs = {
            Fields: [
                {
                    string: 'Classes.ClassDescription.Name'
                },
                {
                    string: 'Classes.StartDateTime'
                }
            ],
            StartDateTime: start.format(soap.DateFormat),
            EndDateTime: end.format(soap.DateFormat),
            SchedulingWindow: true,
            ProgramIDs: [
                {
                    int: 27
                }
            ],
            XMLDetail: 'Bare'
        };
        if (details) {
            workshopArgs.Fields.push({
                string: "Classes.ClassDescription.Description"
            });
        }
        return SArgs(workshopArgs);
    }

    function classArgs(start, end, program, details) {
        var args = {
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
            StartDateTime: start.format(soap.DateFormat),
            EndDateTime: end.format(soap.DateFormat),
            SchedulingWindow: true,
            XMLDetail: 'Bare'
        };
        if (details) {
            args.Fields.push({
                string: 'Classes.ClassDescription.ImageURL'
            });
            args.Fields.push({
                string: 'Classes.ClassDescription.Description'
            });
            args.ProgramIDs = [{
                int: 22
            }];
        }
        return SArgs(args);
    }

    function home(req, res) {
        var now = moment();
        if (now.add('minutes', -30).day() != moment().day())
            now.add('minutes', 30);
        var tmrw = moment(now).add('days', 1).endOf('day');

        var postQuery = Posts.find({
            isPublished: true
        }).select('title body published slug headerImg').sort({
            'published': -1
        }).limit(4);
        var pageQuery = Pages.findOne({
            page: "home"
        });

        //TODO: Is two requests really faster than one giant request?
        Q.all([
            Classes.GetClassesQ(classArgs(now, tmrw)),
            Classes.GetClassesQ(workshopArgs(now, moment().add('months', 2))),
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
                Error(req, res);
            });
    }

    function instructors(req, res) {
        var args = SArgs({
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
        });
        Staff.GetStaffQ(args)
            .then(function (staff) {
                staff = staff.GetStaffResult.StaffMembers.Staff
                    .filter(function (staff) {
                        return staff.ID > 1; //they have weird testing data at lower ID
                    });
                staff.map(function (s, i) { //clear empty Bio's
                    s.Bio = (typeof s.Bio == 'object') ? '' : s.Bio;
                });
                res.render('instructors.html', {
                    staff: staff,
                    title: "Instructors"
                });
            }).fail(function (err) {
                console.error(err);
                Error(req, res);
            });
    }

    function classes(req, res) {
        var now = moment(),
            future = moment().add('weeks', 2),
            program = 22, //regular classes
            details = true;

        Classes.GetClassesQ(classArgs(now, future, program, details))
            .then(function (classes) {
                classes = soap.cleanClasses(classes);
                descriptions = {};
                classes.forEach(function (c) {
                    descriptions[c.ClassDescription.ID] = c.ClassDescription;
                });
                model = [];
                for (var prop in descriptions) {
                    model.push(descriptions[prop]);
                }
                res.render('classes.html', {
                    title: "Classes",
                    classes: model
                });
            }).fail(function (err) {
                console.error(err);
                res.render("error.html");
            });
    }

    function schedule(req, res) {
        var now = moment(),
            future = moment().add('weeks', 2)
            Classes.GetClassesQ(classArgs(now, future))
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
                    Error(req, res);
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
        });
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
