var common = require('./common'),
    Posts = require("../models/post"),
    Users = require("../models/user"),
    moment = require("moment");
var Page = common.Page,
    Q = common.Q;
module.exports = function (soap) {

    function login(req, res){
        Users.authenticate(req.body.email, req.body.password, function(err, isMatch){
            if(isMatch){
                res.cookie("loggedin", "true", {maxAge: 1000*60*60*5, signed:true})
                res.redirect("/admin");
            }
            else{
                res.redirect("/login");
            }
        });
    }
    
    function dashboard(req, res) {
        Q.all([Q.when(Users.find().exec()),
            Q.when(Posts.find().exec())])
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

    //Posts from here
    function parseBody(body) {
        return {
            title: body.title,
            slug: body.slug,
            author: body.author,
            body: body.body
        }
    }

    function teachersToNames(staff) {
        staff = staff[0].GetStaffResult.StaffMembers.Staff
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
        return soap.q(soap.Staff, 'GetStaff', args);
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
               Q.when(Posts.findOne({
                slug: slug
            }).exec())])
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
        Posts.findById(req.body._id, function (err, post) {
            post.title = p.title;
            post.author = p.author;
            
            
            post.body = p.body;
        });
    }

    function addPost(req, res) {
        var post = new Posts(parseBody(req.body));
        post.save(function (err) {
            if (err)
                res.send(err);
            else
                res.send({
                    success: true
                });
        });
    }

    function deletePost(req, res) {
        res.send("under construction");
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
    out.updatePost = updatePost;
    out.editPost = editPost;
    out.deletePost = deletePost;

    out.newUser = newUser;
    out.addUser = addUser;

    return out;
}