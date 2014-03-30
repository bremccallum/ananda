var express = require('express'),
    app = express(),
    server = require('./server');

app.configure(function () {
    app.locals.prod = process.env.NODE_ENV == "production";
    app.use(express.bodyParser());
    app.use(express.cookieParser('super secret string'));
    app.use('/admin', function (req, res, next) {
        if (req.signedCookies.loggedin === "true") {
            res.locals.admin = true;
            next();
        } else {
            console.log("redirecting to login");
            res.redirect("/login");
        }
    });
    server.initialize(app);
    app.use(express.static(__dirname + "/client/public"));
    app.use('/uploads', express.static(__dirname + '/client/uploads'));
});


var port = Number(process.env.PORT || 6969)
app.listen(port, function () {
    console.log('Listening on port ' + port);
});
module.exports = app;
