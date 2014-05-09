var _ = require("lodash"),
    mongoose = require("mongoose-q")(),
    moment = require("moment"),
    Posts = mongoose.model('Post'),
    Pages = mongoose.model('Page'),
    Q = require('q'),
    soap = require("../soap");


function nowMoment() {
    return moment().zone(360);
}

function fail(res, err) {
    console.error(err);
    res.statusCode = 500;
    res.render("error.html", {
        code: 500,
        message: "That means something's gone wrong on our side - sorry about that. We'll strive to get things working again ASAP!"
    });
}

var home = function (req, res) {
    var now = nowMoment(),
        today = now.day(),
        tmrwStart = moment(now).add('days', 1).startOf('day'),
        tmrwEnd = moment(tmrwStart).endOf('day'),

        pageQuery = Pages.findOne({
            page: "home"
        }),

        postQuery = Posts.find({
            isPublished: true
        }).select('title body published slug headerImg').sort({
            'published': -1
        }).limit(4);

    //Rewind time 30 minutes to let people know
    //  what class they just missed,
    //  UNLESS that changes the date.
    now.add('minutes', -30);
    if (now.day() != today) {
        now.add('minutes', 30);
    }
    soap().then(function (MboApiClient) {
        return Q.all([
            MboApiClient.GetClasses({
                start: now,
                end: tmrwEnd
            }),
            MboApiClient.GetWorkshops(),
            postQuery.execQ(),
            pageQuery.execQ()
        ]);
    }).spread(function (classes, workshops, posts, page) {

        classes = _.groupBy(classes, function (c) {
            var date = moment(c.StartDateTime);
            return date.isBefore(tmrwStart) ? 'today' : 'tomorrow';
        });
        var earliestClass = classes.today ? _.min(classes.today, 'StartDateTime') : now;
        var model = {
            today: classes.today,
            tomorrow: classes.tomorrow,
            page: page,
            posts: posts,
            //It's PM if the first class of today is after 4
            pm: moment(earliestClass).hours() >= 16,
            //Group workshops by month and remove duplicates from each month
            workshops: _.mapValues(_.groupBy(workshops, function (ws) {
                return moment(ws.date).format('MMMM');
            }), function (array) {
                return _.uniq(array, function (c) {
                    return c.id;
                });
            })
        };
        res.render('home.html', model);
    }).fail(fail.bind(null, res));
};

var workshops = function (req, res) {
    soap().then(function (MboApiClient) {
        return MboApiClient.GetWorkshops({
            detailed: true
        });
    }).then(function (workshops) {
        //Group the workshops by their name,
        // then map the list of classes that comprise the workshop into
        // a single object that represents their sum.
        workshops = _.map(_.groupBy(workshops, 'name'), function (classes) {
            var starts = _.pluck(classes, 'start'),
                days = [],
                daySorter = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                dateToUnix = function dateToUnix(dateString) {
                    return moment(dateString).valueOf();
                };

            //Create days, which holds what days the class occurs, in order
            _.forEach(starts, function (start) {
                var day = moment(start).format('dddd');
                days[daySorter.indexOf(day)] = day;
            });
            //...and remove the days that the class doesn't occur on
            days = _.reject(days, _.isUndefined);

            return _.assign(classes[0], {
                days: days,
                start: _.min(starts, dateToUnix),
                end: _.max(_.pluck(classes, 'end'), dateToUnix),
                singleton: classes.length == 1 //used for prettier printing
            });
        });
        res.render("workshops.html", {
            workshops: workshops,
            title: "Workshops"
        });
    }).fail(fail.bind(null, res));
};

var instructors = function (req, res) {
    soap().then(function (MboApiClient) {
        return MboApiClient.GetStaff();
    }).then(function (staff) {
        res.render('list-enum.html', {
            objectList: staff,
            title: "Instructors"
        });
    }).fail(fail.bind(null, res));
};

var classes = function (req, res) {
    soap().then(function (MboApiClient) {
        return MboApiClient.GetClasses({
            start: nowMoment(),
            end: nowMoment().add('weeks', 2),
            programID: 22, //normal classes?
            detailed: true
        });
    }).then(function (classes) {
        //Remove duplicates
        classes = _.uniq(classes, function (c) {
            return c.ClassDescription.ID;
        });
        res.render('list-enum.html', {
            title: "Classes",
            objectList: _.map(classes, function (c) {
                return {
                    Name: c.ClassDescription.Name,
                    ImageURL: c.ClassDescription.ImageURL,
                    Description: c.ClassDescription.Description
                };
            })
        });
    }).fail(fail.bind(null, res));
};

var schedule = function (req, res) {
    var now = nowMoment().startOf('day'),
        future = nowMoment().add('weeks', 2).endOf('day');

    soap().then(function (MboApiClient) {
        return MboApiClient.GetClasses({
            start: now,
            end: future
        });
    }).then(function (classes) {
        var dayFormat = 'dddd [the] Do',
            model = {
                classes: _.groupBy(classes, function (c) {
                    return moment(c.StartDateTime).format(dayFormat);
                }),
                days: [now.format(dayFormat)],
                title: 'Schedule'
            };
        //Fill in the dates, so we don't have gaps for days without classes
        while (future.diff(now, 'days') > 0) {
            model.days.push(now.add('days', 1).format(dayFormat));
        }
        res.render("schedule.html", model);
    }).fail(fail.bind(null, res));
};

var viewPost = function (req, res) {
    Posts.findOne({
        slug: req.params.slug
    }, function (err, post) {
        var model = {
            title: post.title,
            post: post
        };
        res.render("news.html", model);
    });
};

exports.home = home;
exports.instructors = instructors;
exports.classes = classes;
exports.schedule = schedule;
exports.viewPost = viewPost;
exports.workshops = workshops;