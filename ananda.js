var express = require('express'),
    app = module.exports = express(),
    server = require('./app');

app.configure(function () {
    app.locals.prod = process.env.NODE_ENV == "production";
    // ### Forms
    app.use(express.json());
    app.use(express.urlencoded());
    
    // ### Session
    // @TODO
    //   Okay, so maybe it's not the most secure cookie 
    //   system and I have research to do.
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
    
    // ### Statics
    app.use('/styles', express.static(__dirname + '/client/public/styles'));
    app.use('/fonts', express.static(__dirname + '/client/public/fonts'));
    app.use('/img', express.static(__dirname + '/client/public/img'));
    app.use('/js', express.static(__dirname + '/client/public/js'));
    app.use('/uploads', express.static(__dirname + '/client/uploads'));
    // ## Load the app!
    server.initialize(app);
});

var port = process.env.PORT || '6969';
app.listen(port, function () {
    console.log('Listening on port ' + port);
});
