var extend = require("extend"),
    app = require("./ananda");
require("./soap")(function (cli) {

    var home = require("./controllers/home")(cli);
    var admin = require("./controllers/admin")(cli);
    




    app.get('/', home.landing);
    app.get('/instructors', home.instructors);
    app.get('/classes', home.classes);
    app.get('/schedule', home.schedule);
    app.get('/news/:slug', home.viewPost);
    
    app.get("/login", function(req, res){res.render("/admin/login.html");});
    app.post("/login", admin.login);
    
    app.get('/admin', admin.dashboard);
    app.get('/admin/post', admin.newPost);
    app.get('/admin/post/:slug', admin.editPost);
    app.put('/admin/post', admin.updatePost);
    app.post('/admin/post', admin.addPost);
    app.delete('/admin/post', admin.deletePost);
    app.post('/admin/post/delete', admin.deletePost);
    
    app.get('/admin/addUser', admin.newUser);
    app.post("/admin/addUser", admin.addUser);
    
});