var Posts = require("mongoose-q")().model('Post'),
    Q = require('q'),
    soap = require("../../soap"),
    _ = require('lodash');

var getTeacherNames = function () {
    return soap().then(function (MboApiClient) {
        return MboApiClient.GetStaff();
    }).then(function (staff) {
        var names = _.map(staff, function (s) {
            return s.Name;
        });
        return names;
    });
};

var parseBody = function (body) {
    var post = {
        title: body.title,
        slug: body.slug,
        author: body.author,
        body: body.body,
        headerImg: body.headerImg
    };
    if (body._id) {
        post._id = body._id;
    }
    return post;
};

// #Routes
var doPost = function (post, options) {
    var deferred = Q.defer();

    function saveToPromise(err, post) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve({
                success: true,
                post: post
            });
        }
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
};

var addPost = function (req, res) {
    getTeacherNames().then(function (names) {
        var model = {
            title: "New Post",
            teacherNames: names
        };
        res.render('/admin/post.html', model);
    });
};
//get
var editPost = function (req, res) {
    var post = Posts.findOne({
        slug: req.params.slug
    });
    Q.all([
        getTeacherNames(),
        post.execQ()
    ]).spread(function (names, post) {
        var model = {
            title: 'Edit Post',
            teacherNames: names,
            post: post
        };
        res.render('/admin/post.html', model);
    });
};
//put
var updatePost = function(req, res) {
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
    }).then(function (post) {
        res.send({
            success: true
        });
    }).fail(function (err) {
        res.send({
            err: err
        });
    });
};

var doAddPost = function (req, res) {
    req.body.create = true;
    updatePost(req, res);
};

exports.add = addPost;
exports.doAdd = doAddPost;
exports.edit = editPost;
exports.update = updatePost;
