var common = require('./common'),
    models = require("../models");
var Page = common.Page;

function teacherObjFromPost(body) {
    return {
        firstName: body.firstName,
        lastName: body.lastName,
        title: body.title,
        email: body.email,
        bio: body.bio
    };
}
exports.teachers = function (req, res) {
    models.Teacher.find({}, function (err, teachers) {
        res.render("teachers.html", Page("Teachers", {
            teachers: teachers
        }));
    });
};
exports.teacher = function (req, res) {
    models.Teacher.findOne({
        name: req.params.name
    }, function (err, teacher) {
        res.render("teacher.html", Page("Teachers | " + teacher.name, {
            teacher: teacher
        }));
    });
};


exports.view = function (req, res) {
    var viewPath = "/admin/teacher.html";
    if (req.query.id) { //Editing a teacher
        models.Teacher.findOne({
            firstName: req.query.id
        }, function (err, teacher) {
            var firstName = common.titleCase(req.query.id);
            if (!teacher || err) {
                res.render(viewPath, ("Edit Teacher", {
                    error: 'Teacher "' + firstName + '" not found. You can add a new one, or maybe you want to go back to <a href="/admin">admin</a>.'
                }));
            } else {
                res.render(viewPath, common.Page("Edit Teacher: " + firstName, {
                    teacher: teacher
                }));
            }
        });
    } else { //Adding teacher
        res.render(viewPath, common.Page("Add new teacher", {
            error: req.query.error,
            success: req.query.success
        }));
    }
};

function updateTeacher(req, res) {
    var key = common.handleKey(req.body.key, res,
        '/admin/teacher?error=Instructor%20{{key}}%20not%20found.%20Update%20failed',
        'Instructor {{key}} not found. Update failed.');
    if (key) {
        models.Teacher.findOne({
            firstName: key
        }, function (err, teacher) {
            teacher.set(teacherObjFromPost(req.body));
            teacher.save(function (err) {
                if (req.xhr) {
                    if (err) {
                        res.send({
                            error: err
                        });
                    } else
                        res.send({
                            success: teacher.firstName
                        });
                } else {
                    if (err) {
                        res.redirect("/admin/teacher?error=" + err.name + "&id=" + key);
                    } else {
                        res.redirect("/admin/teacher?success=" + teacher.firstName + "%20successfully%20updated");
                    }
                }
            }); //end save
        }); //end findOne
    }
};
exports.update = updateTeacher;
exports.add =
    function (req, res) {
        if (req.body.key) {
            updateTeacher(req, res);
        } else {
            var newT = new models.Teacher(teacherObjFromPost(req.body));
            newT.save(function (err) {
                if (req.xhr) {
                    if (err) {
                        res.send({
                            error: err
                        });
                    } else
                        res.send({
                            success: newT.firstName
                        });
                } else {
                    if (err) {
                        res.redirect("/admin/teacher?error=" + err.name);
                    } else {
                        res.redirect("/admin/teacher?success=" + newT.firstName);
                    }
                }
            });
        }
};
exports.remove = function (req, res) {
    if (!req.xhr || !req.body.firstName) {
        res.redirect("/admin");
    } else {
        models.Teacher.findOne({
            firstName: req.body.firstName.toLowerCase()
        }, function (err, teacher) {
            if (teacher) teacher.remove();
            res.send({
                success: true
            });
        });
    }
};