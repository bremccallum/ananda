var formidable = require('formidable'),
    fs = require("fs-extra"),
    path = require('path'),
    Q = require('q'),
    mongoose = require("mongoose-q")(),
    Posts = mongoose.model('Post'),
    Users = mongoose.model("User"),
    Pages = mongoose.model('Page');

module.exports = function (soap) {

    function login(req, res) {
        res.render("/admin/login.html");
    }

    function doLogin(req, res) {
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

    function dashboard(req, res) {
        Q.all([Users.find().execQ(),
            Posts.find().execQ(),
              Pages.find().execQ()])
            .spread(function (users, posts, pages) {
                var model = {
                    posts: posts,
                    users: users,
                    pages: pages
                }
                res.render('/admin/admin.html', model);
            }).done(function (err) {
                if (err) res.send("Error loading posts. Try reloading the page.\nError:" + err);
            });
    }

    // Response: json
    function upload(req, res) {
        //save function adapted from Ghost (ghost.org)
        function save(image) {
            var saved = Q.defer(),
                targetDir = path.resolve(__dirname, '../../../client/public/upload'),
                targetFilename = path.resolve(targetDir, image.name);
            Q.nfcall(fs.mkdirs, targetDir).then(function () {
                return Q.nfcall(fs.exists, targetFilename);
            }).then(function (exists) {
                return Q.nfcall(fs.copy, image.path, targetFilename);
            }).then(function () {
                console.log("Attempting to remove " + image.path);
                return Q.nfcall(fs.remove, image.path).fail(console.log);
            }).then(saved.resolve).fail(function (e) {
                console.error(e);
                if(e === true) {
                    //File exists, from fs.exists call
                    return saved.reject(409);
                }
                return saved.reject(e);
            });
            return saved.promise;
        }


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
                res.send("Upload successful");
            }).fail(function (err) {
                if (err == 409) {
                    return res.send(409, "File already exists")
                }
                res.send(500, "Couldn't save file.");
            });
        })
    }

    var out = {};
    out.dashboard = dashboard;
    out.login = login;
    out.doLogin = doLogin;
    out.upload = upload;
    out.post = require('./post')(soap);
    out.user = require('./user');
    out.page = require('./page');
    return out;
}