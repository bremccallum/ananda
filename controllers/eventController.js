var common = require('./common'),
    models = require("../models");

function eventObjFromPost(body) {
    return {
        name: body.name,
        teacher: body.teacher,
        description: body.desc,
        type: body.type,
        days: body.days,
        startDate: body.startDate,
        endDate: body.endDate,
        startTime: body.startTime,
        length: body.length
    }
}
exports.view = function (req, res) {
    models.Teacher.find({}).select("firstName").exec(function (err, teachers) {
        if (err) res.redirect("/admin?error=Database%20error");
        else {
            var title;
            var model = {
                teachers: teachers,
                dayNames: models.Event.dayNames
            };
            var id = req.query.id;
            if (id) { //Editing
                models.Event.findById(id, function (err, event) {
                    if (!event || err) {
                        model.error = 'Event not found. You can add a new one, or maybe you want to go back to <a href="/admin">admin</a>.';
                        title = "Add Event";
                    } else {
                        model.event = event;
                        title = "Edit Event: " + common.titleCase(event.name);
                    }
                    render();
                });
            } else { //Adding event
                title = "Add Event";
                model.success = req.query.success;
                model.error = req.query.error;
                render();
            }

            function render() {
                res.render("/admin/event.html", common.Page(title, model));
            }
        }
    });
}


function updateEvent(req, res) {
    var key = common.handleKey(req.body.key, res,
        '/admin/event?error=Event%20not%20found.%20Update%20failed',
        'Event not found. Update failed.');
    if (key) {
        models.Event.findById(key, function (err, event) {
            if (!event || err) {
                if (req.xhr) {
                    res.send({
                        error: err
                    });
                } else {
                    res.redirect("/admin/event?error=" + err.name + "&id=" + key);
                }
            } else {
                event.set(eventObjFromPost(req.body));
                event.save(function (err) {
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
                            res.redirect("/admin/event?error=" + err.name + "&id=" + key);
                        } else {
                            res.redirect("/admin/event?success=" + event.firstName + "%20successfully%20updated");
                        }
                    }
                }); //end save
            }
        });
    }
}

exports.update = updateEvent;
exports.add = function (req, res) {
    if (req.body.key) {
        updateEvent(req, res);
    } else {
        var event = new models.Event(eventObjFromPost(req.body));
        if (event.type === "class" && (!event.days || event.days.length === 0)) {
            res.send({
                name: "ValidationError",
                errors: {
                    days: "Regular classes must have at least one day selected."
                }
            });
        } else {
            event.save(function (err) {
                if (err) res.send(err);
                else
                    res.send({
                        success: true
                    });
            });
        }
    }

};
exports.remove = function (req, res) {
    if (!req.xhr || !req.body.id) {
        res.redirect("/admin");
    } else {
        models.Event.findById(req.body.id, function (err, event) {
            if (event) event.remove();
            res.send({
                success: true
            });
        });
    }
};