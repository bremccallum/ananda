var models = require("./model"),
    extend = require("extend"),
    app = require("./ananda"),
    h = require("./helpers");

//Reusable page, makes sure the layout gets what he needs while passing the model
// to whoever is extending.
var Page = function (title, model) {
    this.title = title;
    this.prod = app.get("env") === "Production";
    extend(this, model);
}
app.get('/', function (req, res) {
    res.render("layout.html", new Page("Home"));
});


app.get('/teachers', function (req, res) {
    models.Teacher.find({}, function (err, teachers) {
        res.render("teachers.html", new Page("Teachers", {
            teachers: teachers
        }));
    });
});

app.get('/teachers/:name', function (req, res) {
    models.Teacher.findOne({
        name: req.params.name
    }, function (err, teacher) {
        res.render("teacher.html", new Page("Teachers | " + teacher.name, {
            teacher: teacher
        }));
    });
});

/* 
===================================
          ADMIN
===================================
*/

app.get('/admin', function (req, res) {
    models.Teacher.find().select("firstName").exec(function (err, teachers) {
        var n = [];
        for (var i = 0; i < teachers.length; i++) {
            n.push(teachers[i].firstName);
        }
        res.render("admin/admin.html", new Page("Ananda Yoga Website Administration", {
            teachersNames: n
        }));
    });
});
//
//View Teacher
//
app.get('/admin/teacher', function (req, res) {
    var viewPath = "admin/teacher.html";
    if (req.query.t) { //Editing a teacher
        models.Teacher.findOne({
            firstName: req.query.t
        }, function (err, teacher) {
            var firstName = h.titleCase(req.query.t);
            if (!teacher || err) {
                res.render(viewPath, new Page("Edit Teacher", {
                    err: 'Teacher "' + firstName + '" not found.'
                }));
            } else {
                res.render(viewPath, new Page("Edit Teacher: " + firstName, {
                    teacher: teacher
                }));
            }
        });
    } else { //Adding teacher
        res.render(viewPath, new Page("Add new teacher", {
            err: req.query.err,
            success: req.query.success
        }));
    }
});
//
//Update teacher
//
app.put('/admin/teacher', updateTeacher);

function updateTeacher(req, res) {
    var key = req.body.key;
    if (!key) {
        res.redirect('/admin/teacher?error=Instructor%20' + key + '%20not%20found.%20Update%20failed');
    } else {
        models.Teacher.findOne({
            firstName: key
        }, function (err, teacher) {
            teacher.set({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                title: req.body.title,
                email: req.body.email,
                bio: req.body.bio
            });
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
                        res.redirect("/admin/teacher?error=" + err.name + "&t=" + key);
                    } else {
                        res.redirect("/admin/teacher?success=" + teacher.firstName + "%20successfully%20updated");
                    }
                }
            }); //end save
        }); //end findOne
    } //end else
} //end function

//
//Add teacher
//
app.post('/admin/teacher', function (req, res) {
    if (req.body.key) {
        updateTeacher(req, res);
    } else {
        var newT = new models.Teacher({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            title: req.body.title,
            email: req.body.email,
            bio: req.body.bio
        });
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
});
//
//Delete teacher (ajax only)
//
app.post('/admin/teacher/delete', function (req, res) {
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
});