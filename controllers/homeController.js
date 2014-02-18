var common = require('./common'),
    models = require("../models");
var Page = common.Page;


exports.landing = function (req, res) {
    var model = {};
    var events = models.Event;
    var today = events.todayInt();
    var tomorrow = (today + 1) % 7;
    model.pm = new Date().getHours()>16;
    models.Event.find({
        type: "class",
        days: {
            $in:[today, tomorrow]
        }
    }).exec()
        .then(function (events) {
            function dayFilter(d) {
                return function (e) {
                    return e.days.indexOf(d) != -1;
                }
            }
            model.upcoming = {}
            model.upcoming.today = events.filter(dayFilter(today)).filter(function (c) {
                return !c.alreadyHappenedToday();;
            });
            model.upcoming.tomorrow = events.filter(dayFilter(tomorrow));
        }).then(render, render);

    function render(err) {
        res.render("landing.html", Page("Ananda Yoga", model));
    }
}