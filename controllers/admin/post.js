var Posts = require("mongoose-q")().model('Post'),
    Q = require('q');

module.exports = function (soap) {

    //#Helpers
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

    // #Routes
    function doPost(post, options) {
        var deferred = Q.defer();

        function saveToPromise(err, post) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve({
                    success: true,
                    post: post
                });
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

    function addPost(req, res) {
        getTeacherPromise().then(function (teachers) {
            var model = {
                title: "New Post",
                teacherNames: teachersToNames(teachers)
            };
            res.render('/admin/post.html', model);
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
                    title: 'Edit Post',
                    teacherNames: teachersToNames(teachers),
                    post: post
                };
                res.render('/admin/post.html', model);
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

    function doAddPost(req, res) {
        req.body.create = true;
        updatePost(req, res);
    }
    var out = {};
    out.add = addPost;
    out.doAdd = doAddPost;
    out.edit = editPost;
    out.update = updatePost;
    return out;
}
