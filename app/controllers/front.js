var Q = require('q'),
    mongoose = require("mongoose-q")(),
    moment = require("moment"),
    _ = require("lodash"),
    Posts = mongoose.model('Post'),
    Pages = mongoose.model('Page');

function Workshop(mboWorkshop) {
    this.id = mboWorkshop.ClassDescription.ID;
    this.date = mboWorkshop.StartDateTime;
    this.name = mboWorkshop.ClassDescription.Name;
    this.teacher = mboWorkshop.Staff.Name;
    this.image = mboWorkshop.ClassDescription.ImageURL;
    this.start = mboWorkshop.StartDateTime;
    this.end = mboWorkshop.EndDateTime;
    //empty descriptions appear as objects.
    this.description = mboWorkshop.ClassDescription.Description;
    if (_.isUndefined(this.description) || _.isObject(this.description)) {
        this.description = "";
    }
    return this;
}

function fail(res, err) {
    console.error(err);
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
        if (program) {
            args.ProgramIDs = [{
                int: program
            }];
        }
        if (details) {
            args.Fields.push({
                string: 'Classes.ClassDescription.ImageURL'
            });
            args.Fields.push({
                string: 'Classes.ClassDescription.Description'
            });
            args.Fields.push({
                string: 'Classes.EndDateTime'
            });
        }
        return SArgs(args);
    }

    function workshopArgs(details) {
        return classArgs(moment(), moment().add('months', 2), 27, details);
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
            Classes.GetClassesQ(workshopArgs()),
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
            }).fail(fail.bind(null, res));
    }

    function workshops(req, res) {
        Classes.GetClassesQ(workshopArgs(true)).then(function (workshopClasses) {
            workshopClasses = soap.cleanClasses(workshopClasses);
            workshops = workshopClasses.map(function (ws) {
                return new Workshop(ws);
            });
            workshops = _.map(_.groupBy(workshops, 'name'), function (classes) {
                console.log(classes);
                //make each workshop a pretty object rather than a list of.
                var starts = _.pluck(classes, 'start'),
                    days = [],
                    daySorter = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


                _.forEach(starts, function (start) {
                    var day = moment(start).format('dddd');
                    days[daySorter.indexOf(day)] = day;
                });
                days = _.reject(days, _.isUndefined);
                function dateToUnix (dateString) {
                    return moment(dateString).valueOf();
                }
                return _.assign(classes[0], {
                    days: days,
                    start: _.min(starts, dateToUnix),
                    end: _.max(_.pluck(classes, 'end'), dateToUnix),
                    singleton: classes.length == 1//used for prettier printing
                });
            });
            console.log(workshops);
            res.render("workshops.html", {
                workshops: workshops,
                title: "Workshops"
            });
        }).fail(fail.bind(null, res))
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
                staff = staff.map(function (s) { //clear empty Bio's
                    s.Bio = (typeof s.Bio == 'object') ? '' : s.Bio;
                    var m = {
                        Name: s.Name,
                        Email: s.Email,
                        Image: s.ImageURL,
                        Description: s.Bio
                    }
                    return m;
                });
                res.render('list-enum.html', {
                    objectList: staff,
                    title: "Instructors"
                });
            }).fail(fail.bind(null, res));
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
                classes.forEach(function (c) { //unique-ify
                    descriptions[c.ClassDescription.ID] = c.ClassDescription;
                });
                classes = []
                for (var key in descriptions) { //list-ify
                    var d = descriptions[key];
                    classes.push({
                        Name: d.Name,
                        Image: d.ImageURL,
                        Description: d.Description
                    });
                }
                res.render('list-enum.html', {
                    title: "Classes",
                    objectList: classes
                });
            }).fail(fail.bind(null, res));
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
                }).fail(fail.bind(null, res));
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
    out.workshops = workshops;
    return out;
}