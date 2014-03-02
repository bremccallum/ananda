var common = require('./common'),
    models = require("../models"),
    moment = require("moment");
var Page = common.Page,
    Q = common.Q;
module.exports = function (soap) {
    function dashboard(req, res) {
        var model = {
            posts:[
                {
                    author:"Matt Enlow",
                    title:"A Test Post",
                    slug:"a-test-post",
                    isPublished:true,
                    published:moment().toDate()
                }
                
            ]
        }
        
        res.render('/admin/admin.html', model);
    }


    //Posts from here
    function postFromBody(body) {
        return {
            error: "Not yet implemented"
        }
    }

    function newPost(req, res) {
        res.send("under construction");
    }
    function editPost(req, res) {
        res.send("under construction");
    }
    function updatePost(req, res) {
        res.send("under construction");
    }

    function addPost(req, res) {
        res.send("under construction");
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