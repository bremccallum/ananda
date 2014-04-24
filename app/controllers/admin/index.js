var formidable = require('formidable'),
    fs = require("fs-extra"),
    path = require('path'),
    Q = require('q'),
    mongoose = require("mongoose-q")(),
    Posts = mongoose.model('Post'),
    Users = mongoose.model("User"),
    Pages = mongoose.model('Page'),

    uploadDir = path.resolve(__dirname, '../../../client/public/uploads');

var login = function (req, res) {
    res.render("/admin/login.html");
}

var doLogin = function (req, res) {
    Users.authenticate(req.body.email, req.body.password, function (err, isMatch) {
        if (isMatch) {
            res.cookie("loggedin", "true", {
                maxAge: 1000 * 60 * 60 * 5,
                signed: true
            })
            res.redirect("/admin");
        } else {
            res.redirect("/login");
        }
    });
}

var dashboard = function (req, res) {
    Q.all([Users.find().execQ(),
            Posts.find().execQ(),
              Pages.find().execQ(),
              Q.nfcall(fs.readdir, uploadDir)])
        .spread(function (users, posts, pages, images) {
            var model = {
                posts: posts,
                users: users,
                pages: pages,
                images: images
            }
            res.render('/admin/admin.html', model);
        }).fail(function (err) {
            if (err) res.send("Error loading posts. Try reloading the page.\nError:" + err);
        });
}

// Response: json
var upload = function (req, res) {
    //save function adapted from Ghost (ghost.org)
    function save(image) {
        var saved = Q.defer(),
            targetDir = uploadDir,
            targetFilename = path.resolve(targetDir, image.name);
        Q.nfcall(fs.mkdirs, targetDir).then(function () {
            return Q.nfcall(fs.exists, targetFilename);
        }).then(function (exists) {
            return Q.nfcall(fs.copy, image.path, targetFilename);
        }).then(function () {
            console.log("Attempting to remove " + image.path);
            return Q.nfcall(fs.remove, image.path).fail(console.error.bind(console, "Couldn't delete file: "));
        }).then(saved.resolve).fail(function (e) {
            console.error(e);
            if (e === true) {
                //File exists, from fs.exists call
                return saved.reject(409);
            }
            return saved.reject(e);
        });
        return saved.promise;
    }

    try {
        form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                return res.send(500, "Error parsing upload.");
            }

            var type = files.uploadimage.type,
                ext = path.extname(files.uploadimage.name).toLowerCase();

            if ((type !== 'image/jpeg' && type !== 'image/png' && type !== 'image/gif' && type !== 'image/svg+xml') || (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.gif' && ext !== '.svg' && ext !== '.svgz')) {
                return res.send(415, 'Unsupported Media Type');
            }
            save(files.uploadimage).then(function () {
                res.send({
                    success: true,
                    name: files.uploadimage.name
                });
            }).fail(function (err) {
                if (err == 409) {
                    return res.send(409, "File already exists")
                }
                res.send(500, "Couldn't save file.");
            });
        })
    } catch (e) {
        console.error(e.message);
        res.send(500, "Internal server error");
    }
}

var deleteImage = function (req, res) {
    var fileToDelete = req.body.name;
    fs.unlink(path.resolve(uploadDir, fileToDelete));
    res.send("Deleted");
}

exports.dashboard = dashboard;
exports.login = login;
exports.doLogin = doLogin;
exports.upload = upload;
exports.deleteImage = deleteImage;
exports.post = require('./post');
exports.user = require('./user');
exports.page = require('./page');
