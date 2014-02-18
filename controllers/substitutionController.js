var common = require('./common'),
    models = require("../models");

function subObjFromPost(body) {
    var e = body.event.split('|');
    return {
        teacher: body.teacher,
        event: {id:e[0], name:e[1]},
        date: body.date
    }
}

exports.view = function (req, res) {
    var title;
    var model = {
        dayNames: models.Event.dayNames,
        errors: []
    };
    models.Teacher.find({}).select("firstName").exec()
        .then(function (teachers) {
            model.teachers = teachers;
            return models.Event.find({
                type: "class"
            }).exec();
        }).then(function (classes) {
            model.classes = classes;
        }).then(function () {
            loaded();
        }, function (err) {
            model.errors.push(err);
            loaded();
        });

    function loaded() {
        var id = req.query.id;
        if (id) { //Editing
            models.Substitution.findById(id, function (err, sub) {
                if (!sub || err) {
                    model.errors.push({
                        message: 'Substitution not found. You can add a new one, or maybe you want to go back to <a href="/admin">admin</a>.'
                    });
                } else {
                    model.sub = sub;
                    title = "Edit Substitution";
                }
                render();
            });
        } else { //Adding event
            title = "Add Event";
            render();
        }
    }

    function render() {
        model.success = req.query.success;
        model.errors.push(req.query.error);
        res.render("/admin/substitution.html", common.Page(title, model));
    }
}


function updateSubstitution(req, res) {
    var key = common.handleKey(req.body.key, res,
        '/admin/substitution?error=Substitution%20not%20found.%20Update%20failed',
        'Substitution not found. Update failed.');
    if (key) {
        models.Substitution.findById(key, function (err, sub) {
            if (!sub || err) {
                if (req.xhr) {
                    res.send({
                        error: err
                    });
                } else {
                    res.redirect("/admin/substitution?error=" + err.name + "&id=" + key);
                }
            } else {
                sub.set(subObjFromPost(req.body));
                sub.save(function (err) {
                    if (req.xhr) {
                        if (err) {
                            res.send({
                                error: err
                            });
                        } else
                            res.send({
                                success: true
                            });
                    } else {
                        if (err) {
                            res.redirect("/admin/substitution?error=" + err.name + "&id=" + key);
                        } else {
                            res.redirect("/admin/substitution?success=Substitution%20successfully%20updated");
                        }
                    }
                }); //end save
            }
        });
    }
}

exports.update = updateSubstitution;
exports.add = function (req, res) {
    if (req.body.key) {
        updateSubstitution(req, res);
    } else {
        var sub = new models.Substitution(subObjFromPost(req.body));
        sub.save(function (err) {
            if (err) res.send(err);
            else
                res.send({
                    success: true
                });
        });
    }
};
exports.remove = function (req, res) {
    if (!req.xhr || !req.body.id) {
        res.redirect("/admin");
    } else {
        models.Substitution.findById(req.body.id, function (err, event) {
            if (event) event.remove();
            res.send({
                success: true
            });
        });
    }
};