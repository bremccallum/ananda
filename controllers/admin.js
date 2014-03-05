var common = require('./common'),
    Posts = require("../models/post"),
    moment = require("moment");
var Page = common.Page,
    Q = common.Q;
module.exports = function (soap) {
    function dashboard(req, res) {
        Posts.find(function (err, posts) {
            var model = {
                posts: posts
            }
            if (err) res.send("Error loading posts. Try reloading the page.\nError:" + err);
            else
                res.render('/admin/admin.html', Page("Admin | Ananda Yoga", model));
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

    function updatePost(req, res) {
        var slug = req.body.slug;
        Posts.findOne({
            slug: slug
        }, function (err, post) {

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
    //exports
    var out = {};
    out.dashboard = dashboard;
    out.deletePost = deletePost;
    out.addPost = addPost;
    out.newPost = newPost;
    out.updatePost = updatePost;
    out.editPost = editPost;
    return out;
}