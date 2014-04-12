module.exports = function (app, soap) {
    var front = require("./controllers/front")(soap),
        admin = require("./controllers/admin")(soap);

    function redirect(where) {
        return function (req, res) {
            res.redirect(where);
        }
    }

    app.get('/', front.home);
    app.get('/instructors', front.instructors);
    app.get('/classes', front.classes);
    app.get('/workshops', front.workshops);
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

    app.get('/admin/page', redirect('/admin'))
    app.get('/admin/page/:page', admin.page.edit);
    app.put('/admin/page', admin.page.update);


    app.get('/admin/upload', function (req, res) { //testing, be sure to delete
        res.writeHead(200, {
            'content-type': 'text/html'
        });
        res.end(
            '<form action="/admin/upload" enctype="multipart/form-data" method="post">' +
            '<input type="text" name="title"><br>' +
            '<input type="file" name="uploadimage" multiple="multiple"><br>' +
            '<input type="submit" value="Upload">' +
            '</form>'
        );
    });
    app.post('/admin/upload', admin.upload);
    app.post('/admin/image/delete', admin.deleteImage)

    app.get("/cache", function (req, res) {
        res.send("Whoa, you found a secret that does nothing");
    });

    app.all("*", function (req, res) {
        res.statusCode = 404;
        res.render("error.html", {
            code: 404,
            message: "That means we couldn't find the page you were looking for. Why not head back to the home page and try again?"
        });
    })
}