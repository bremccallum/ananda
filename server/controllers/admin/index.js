var Q = require('q'),
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

    var out = {};
    out.dashboard = dashboard;
    out.login = login;
    out.doLogin = doLogin;
    out.post = require('./post')(soap);
    out.user = require('./user');
    out.page = require('./page');
    return out;
}
