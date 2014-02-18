var common = require('./common'),
    models = require("../models");

exports.home = function (req, res) {
    model = {days: models.Event.dayNamesShort};
    models.Teacher.find().select("firstName").exec()
        .then(function (teachers) {
            var n = [];
            for (var i = 0; i < teachers.length; i++) {
                n.push(teachers[i].firstName);
            }
            model.teachersNames = n;
            return models.Event.find().exec();
        })
        .then(function (events) {
            model.events = events;
            return models.Substitution.find().exec();
        })
        .then(function (subs) {
                model.subs = subs;
                res.render("admin/admin.html", common.Page("Ananda Yoga Website Administration", model));
            },
            function (err) {
                res.send("Error. Try reloading page.");
            }
    );
}