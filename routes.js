var models = require("./models"),
    extend = require("extend"),
    app = require("./ananda");
require("./soap")(function (cli) {

    var home = require("./controllers/home")(cli);
    var admin = require("./controllers/admin")(cli);




    app.get('/', home.landing);
    app.get('/instructors', home.instructors);
    app.get('/classes', home.classes);
    app.get('/schedule', home.schedule);
    app.get('/news/:slug', function(req, res){
        res.send("Under construction");
    });
    app.get('/admin', admin.dashboard);
    /*
======================================================================
Posts
======================================================================
    */
    app.get('/admin/post', admin.newPost);
    app.get('/admin/post/:slug', admin.editPost);
    app.put('/admin/post', admin.updatePost);
    app.post('/admin/post', admin.addPost);
    app.delete('/admin/post', substitution.deletePost);
    app.post('/admin/post/delete', substitution.deletePost);
});