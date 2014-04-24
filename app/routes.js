var app = require("../ananda"),
    front = require("./controllers/front"),
    admin = require("./controllers/admin"),
    cache = require('./cache');

function redirect(where) {
    return function (req, res) {
        res.redirect(where);
    };
}
// @TODO enable etag support with cache
app.disable('etag');
//## Front
app.get('/', cache, front.home);
app.get('/instructors', cache, front.instructors);
app.get('/classes', cache, front.classes);
app.get('/workshops', cache, front.workshops);
app.get('/schedule', cache, front.schedule);
app.get('/news/:slug', cache, front.viewPost);

//## Login
app.get("/login", admin.login);
app.post("/login", admin.doLogin);

//## Admin
//### Blog
app.get('/admin', admin.dashboard);
app.get('/admin/post', admin.post.add);
app.post('/admin/post', admin.post.doAdd);
app.get('/admin/post/:slug', admin.post.edit);
app.put('/admin/post', admin.post.update);

//### User
app.get('/admin/user', admin.user.add);
app.post("/admin/user", admin.user.doAdd);
app.get('/admin/user/:id', admin.user.edit);
app.put('/admin/user', admin.user.update);
app.post('/admin/user/delete', admin.user.delete);

//### Page
app.get('/admin/page', redirect('/admin'));
app.get('/admin/page/:page', admin.page.edit);
app.put('/admin/page', admin.page.update);

//### Image
app.post('/admin/upload', admin.upload);
app.post('/admin/image/delete', admin.deleteImage);

app.post('/admin/cache/reset', cache.reset, redirect('/admin'));

app.all("*", function (req, res) {
    res.statusCode = 404;
    res.render("error.html", {
        code: 404,
        message: "That means we couldn't find the page you were looking for. Why not head back to the home page and try again?"
    });
});
