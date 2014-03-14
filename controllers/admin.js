var Q = require('q'),
    moment = require("moment"),
    mongoose = require("mongoose-q")(),
    Posts = mongoose.model('Post'),
    Users = mongoose.model("User"),
    Page = require('./common').Page;
module.exports = function (soap) {

    function login(req, res) {
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
    //'/admin'
    function dashboard(req, res) {
        Q.all([Users.find().execQ(),
            Posts.find().execQ()])
            .spread(function (users, posts) {
                var model = {
                    posts: posts,
                    users: users
                }
                res.render('/admin/admin.html', Page("Admin | Ananda Yoga", model));
            }).done(function (err) {
                if (err) res.send("Error loading posts. Try reloading the page.\nError:" + err);
            });
    }


    function teachersToNames(staff) {
        staff = staff.GetStaffResult.StaffMembers.Staff
            .filter(function (staff) {
                return staff.ID > 1; //they have weird testing data at lower ID
            });
        staff.map(function (v, i) {
            staff[i] = v.Name;
        });
        return staff;
    }

    function getTeacherPromise(callback) {
        var args = {
            Fields: [
                {
                    string: 'Staff.Name'
                }
            ],
            XMLDetail: 'Bare'
        };
        return soap.Staff.GetStaffQ(soap.setArgs(args));
    }

    ////////////////////////////////
    /////////// POSTS  /////////////
    ////////////////////////////////

    function parseBody(body) {
        var post = {
            title: body.title,
            slug: body.slug,
            author: body.author,
            body: body.body
        };
        if (body._id)
            post._id = body._id;
        return post;
    }

    function doPost(post, options) {
        var deferred = Q.defer();

        function saveToPromise(err, post) {
            if (err)
                deferred.reject(err)
            else
                deferred.resolve({
                    success: true,
                    post: post
                })
        }

        if (options.publish) {
            post.isPublished = true;
            post.published = moment().toDate();
        } else if (options.unpublish) {
            post.isPublished = false;
        }

        if (options.create) {
            post = new Posts(post);
            post.save(saveToPromise);
            return deferred.promise;
        }
        Posts.findById(post._id, "+versions").execQ()
            .then(function (_post) {
                _post.versions.push({
                    date: _post.modified,
                    body: _post.body
                });
                _post.set(post);
                _post.save(saveToPromise);
            }).fail(function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    }

    function newPost(req, res) {
        getTeacherPromise().then(function (teachers) {
            var model = {
                teacherNames: teachersToNames(teachers)
            };
            res.render('/admin/post.html', Page('New Post', model))
        });
    }
    //get
    function editPost(req, res) {
        var slug = req.params.slug;
        Q.all([getTeacherPromise(),
           Posts.findOne({
                slug: slug
            }).execQ()])
            .spread(function (teachers, post) {
                var model = {
                    teacherNames: teachersToNames(teachers),
                    post: post
                };
                res.render('/admin/post.html', Page('Edit Post', model));
            });
    }
    //put
    function updatePost(req, res) {
        var p = parseBody(req.body);
        var publish = false,
            unpublish = false;
        if (req.body.publish == "true") {
            publish = true;
        } else if (req.body.unpublish == "true") {
            unpublish = true;
        }

        doPost(p, {
            publish: publish,
            unpublish: unpublish,
            create: !! req.body.create //from addPost
        })
            .then(function (post) {
                res.send({
                    success: true
                });
            }).fail(function (err) {
                res.send({
                    err: err
                });
            });
    }

    function addPost(req, res) {
        req.body.create = true;
        updatePost(req, res);
    }


    ///////////////////////////////////////////////////////
    ///////////////// USER ///////////////////////////////
    /////////////////////////////////////////////////////

    function newUser(req, res) {
        var model = {};
        res.render("admin/user.html", Page("Add User", model));
    }

    function addUser(req, res) {
        var body = req.body;
        var user = new Users({
            email: body.email,
            password: body.password
        });
        user.save(function (err, user) {
            if (err) res.send(err);
            else res.send({
                success: true
            });
        });
    }
    //exports
    var out = {};
    out.dashboard = dashboard;

    out.login = login;

    out.newPost = newPost;
    out.addPost = addPost;

    out.editPost = editPost;
    out.updatePost = updatePost;

    out.newUser = newUser;
    out.addUser = addUser;

    return out;
}