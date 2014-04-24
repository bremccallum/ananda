var Q = require('q'),
    mongoose = require("mongoose-q")(),
    Users = mongoose.model("User");

///////////////////////////////////////////////////////
///////////////// USER ///////////////////////////////
/////////////////////////////////////////////////////

function addUser(req, res) {
    var model = {
        title: "Add User"
    };
    res.render("admin/user.html", model);
}

function doAddUser(req, res) {
    var body = req.body;
    var user = new Users({
        email: body.email,
        password: body.password
    });
    user.save(function (err, user) {
        if (err) {
            res.send(err);
        } else {
            res.send({
                success: true
            });
        }
    });
}

function editUser(req, res) {
    Users.findByIdQ(req.body.id).then(function (user) {
        res.render('admin/user.html', {
            edit: true,
            name: user.name,
            email: user.email
        });
    }).fail(function (err) {
        res.render('admin/user.html', err);
    });
}


function updateUser(req, res) {
    var email = req.body.email,
        password = req.body.password,
        newPassword = req.body.newPassword || password;
    var user = Users.findByIdQ(req.body.id).then(function (user) {
        user.email = req.body.email || user.email;
        user.password = req.body.password || user.password;
        user.name = req.body.name || user.name;
        user.save(function (err) {
            res.send(err || {
                success: true
            });
        });
    });
    Users.authenticate(email, password, function (err, isMatch) {
        if (isMatch) {
            Users.updateQ({
                email: email
            }, {
                password: newPassword,
                name: req.body.name

            }).then(function (success) {
                    res.send({
                        success: success
                    });
                },
                function (err) {
                    res.send({
                        err: error
                    });
                });
        }
    });
}

function deleteUser(req, res) {
    Users.remove({
        _id: req.body.id
    }, function (err) {
        if (err) {
            res.send(err);
        } else {
            res.send({
                success: true
            });
        }
    });
}

exports.add = addUser;
exports.doAdd = doAddUser;
exports.edit = editUser;
exports.update = updateUser;
exports.delete = deleteUser;
