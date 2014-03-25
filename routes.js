var extend = require("extend"),
    app = require("./ananda"),
    //half an hour?
    CACHE_TIME = 1000 * 60 * 30;
require("./soap")(function (cli) {

    var home = require("./controllers/home")(cli),
        admin = require("./controllers/admin")(cli);
    var cache = require('./cache')(app);

    app.use('/', cache(CACHE_TIME, '/'));
    app.use('/instructors', cache(CACHE_TIME, '/instructors'));
    app.use('/classes', cache(CACHE_TIME, '/classes'));
    app.use('/schedule', cache(CACHE_TIME, '/schedule'));
    app.use('/news/:slug', cache(CACHE_TIME, '/news/:slug'));


    app.get('/', home.landing);
    app.get('/instructors', home.instructors);
    app.get('/classes', home.classes);
    app.get('/schedule', home.schedule);
    app.get('/news/:slug', home.viewPost);

    app.get("/login", function (req, res) {
        res.render("/admin/login.html");
    });
    app.post("/login", admin.login);

    app.get('/admin', admin.dashboard);
    app.get('/admin/post', admin.newPost);
    app.get('/admin/post/:slug', admin.editPost);
    app.put('/admin/post', admin.updatePost);
    app.post('/admin/post', admin.addPost);

    app.get('/admin/addUser', admin.newUser);
    app.post("/admin/addUser", admin.addUser);

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
