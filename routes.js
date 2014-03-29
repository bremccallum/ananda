var app = require("./ananda");
//Make sure schema & models are ready before loading controllers
require("./controllers/soap")(function (cli) {

    var front = require("./controllers/front")(cli),
        admin = require("./controllers/admin")(cli);
    function redirect(req, res) {
        res.redirect('/admin');
    }

    app.get('/', front.home);
    app.get('/instructors', front.instructors);
    app.get('/classes', front.classes);
    app.get('/schedule', front.schedule);
    app.get('/news/:slug', front.viewPost);


    app.get("/login", admin.login);
    app.post("/login", admin.doLogin);

    app.get('/admin', admin.dashboard);
    app.get('/admin/post', admin.post.add);
    app.post('/admin/post', admin.post.doAdd);
    app.get('/admin/post/:slug', admin.post.edit);
    app.put('/admin/post', admin.post.update);

    app.get('/admin/user', admin.user.add);
    app.post("/admin/user", admin.user.doAdd);
    app.get('/admin/user/:id', admin.user.edit);
    app.put('/admin/user', admin.user.update);
    app.post('/admin/user/delete', admin.user.delete);

    app.get('/admin/page', redirect)
    app.get('/admin/page/:page', admin.page.edit);
    app.put('/admin/page', admin.page.update);

    app.get("/cache", function (req, res) {
        res.send("Whoa, you found a secret that does nothing");
    });
    app.get("/error", function (req, res) {
        res.statusCode = 500;
        res.render("error.html", {
            code: 500,
            message:"That means somethings go wrong on our side - sorry about that. We'll strive to get things working again ASAP!"
        });
    })
    app.all("*", function (req, res) {
        res.statusCode = 404;
        res.render("error.html", {
            code: 404,
            message:"That means we couldn't find the page you were looking for. Why not head back to the home page and try again?"
        });
    })
});
