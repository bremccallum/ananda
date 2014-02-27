var common = require('./common'),
    models = require("../models"),
    Page = common.Page;


exports.schedule = function (req, res) {
    var model = {};
    models.Event.find({
        type: 'class'
    }).exec()
        .then(function (classes) {
            var classIds = classes.map(function (c) {
                return c._id
            });
            model.classes = classes;
            return models.Substitution.find({
                event: {
                    id: {
                        $in: classIds
                    }
                }
            }).exec();
        })
        .then(function (subs) {
            console.log(subs);
            model.subs = subs;
            render();
        },render);
    function render(e) {
    console.log("rendering??", model);
        res.render("schedule.html", Page("Schedule", model));
    }
}