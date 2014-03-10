var Page = require('./common').Page,
    Posts = require("../models/post"),
    moment = require("moment"),
    Q = require("q");
module.exports = function (soap) {
    function landing(req, res) {
        console.time("Landing");
        var now = moment();
        if (now.add('minutes', -30).day() != moment().day())
            now.add('minutes', 30);
        var tmrw = moment(now).add('days', 1).endOf('day');
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
            StartDateTime: now.format('YYYY-MM-DD[T]HH:mm:ss'),
            EndDateTime: tmrw.format('YYYY-MM-DD[T]HH:mm:ss'),
            SchedulingWindow: true,
            XMLDetail: 'Bare'
        };
        var workshopArgs = {
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
            StartDateTime: now.format('YYYY-MM-DD[T]HH:mm:ss'),
            EndDateTime: moment(tmrw).add('months', 2).format('YYYY-MM-DD[T]HH:mm:ss'),
            SchedulingWindow: true,
            ProgramIDs: [
                {
                    int: 27
                }
            ],
            XMLDetail: 'Bare'
        }
        //get classes
        Q.all([soap.q(soap.Classes, 'GetClasses', args),
               soap.q(soap.Classes, 'GetClasses', workshopArgs),
              Q.when(Posts.find().exec())])
            .spread(function (classes, workshops, posts) {
                if (0 == classes[0].GetClassesResult.ResultCount)
                    classes = [];
                else {
                    classes = classes[0].GetClassesResult.Classes.Class;
                    if (classes.length === undefined) { //only one class
                        classes = [classes];
                    }
                }
                var tmrwStart = tmrw.startOf('day');
                var model = {
                    posts: posts,

                    today: classes.filter(function (ele) {
                        var d = moment(ele.StartDateTime);
                        return d.isBefore(tmrwStart);
                    }),
                    tmrw: classes.filter(function (ele) {
                        return moment(ele.StartDateTime).isAfter(moment(now).endOf('day'));
                    }),
                    workshops: workshops[0].GetClassesResult.Classes.Class,
                    pm: now.hours() >= 16
                };
                res.render('landing.html', Page("Ananda Yoga", model));
                console.timeEnd("Landing");
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
        soap.q(soap.Staff, 'GetStaff', args)
            .done(function (staff) {
                staff = staff[0].GetStaffResult.StaffMembers.Staff
                    .filter(function (staff) {
                        return staff.ID > 1; //they have weird testing data at lower ID
                    });
                staff.map(function (s, i) { //clear empty Bio's
                    s.Bio = (typeof s.Bio == 'object') ? '' : s.Bio;
                });
                var model = {};
                model.staff = staff;
                res.render('instructors.html', Page("Instructors | Ananda Yoga", model))
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
        soap.q(soap.Classes, 'GetClassDescriptions', args)
            .done(function (classes) {
                classes = classes[0].GetClassDescriptionsResult.ClassDescriptions.ClassDescription;
                classes.map(function (o, i) {
                    o.Description = (typeof o.Description == 'object') ? '' : o.Description;
                });
                res.render('classes.html', Page("Classes", {
                    classes: classes
                }));
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
        soap.q(soap.Classes, 'GetClasses', args)
            .done(function (classes) {
                var model = {
                    classes: {},
                    days: []
                };
                for (var i = 0; i <= future.diff(now, 'days'); i++) {
                    var m = moment(now).add('days', i).format("dddd [the] Do");
                    model.days.push(m);
                    model.classes[m] = [];
                }
                classes[0].GetClassesResult.Classes.Class.forEach(function (c) {
                    model.classes[moment(c.StartDateTime).format("dddd [the] Do")].push(c);
                });

                res.render("schedule.html", Page("Schedule | Ananda Yoga", model));
            });
    }

    function viewPost(req, res) {
        Posts.findOne({
            slug: req.params.slug
        }, function (err, post) {
            var model = {
                post: post
            };
            res.render("news.html", Page(post.title, model));
        })
    }
    //exports
    var out = {};
    out.landing = landing;
    out.instructors = instructors;
    out.classes = classes;
    out.schedule = schedule;
    out.viewPost = viewPost;
    return out;
}