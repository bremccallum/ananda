var express = require('express'),
    app = express(),
    cache = require('./cache'),
    moment = require("moment"),
    nunjucks = require("nunjucks"),

    CACHE_TIME = 1000 * 60 * 30;

app.configure(function () {
    //Connect to database
    require("./models");
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
    app.disable("etag");
    app.use('/', cache(CACHE_TIME, '/'));
    app.use('/instructors', cache(CACHE_TIME, '/instructors'));
    app.use('/classes', cache(CACHE_TIME, '/classes'));
    app.use('/schedule', cache(CACHE_TIME, '/schedule'));
    //half an hour?
    require('./routes');
    app.use(express.static(__dirname + "/public"));
});
//
//   Templating
//
nunjucks = nunjucks.configure('views', {
    watch: true,
    autoescape: true,
    express: app
});
nunjucks.addFilter('prettyDate', function (v) {
    return (moment(v).format("M-DD-YY"));
});
nunjucks.addFilter('prettyTime', function (v) {
    return (moment(v).format("h:mm a"));
});
nunjucks.addFilter("regexReplace", function (v, pattern, flags, new_) {
    if (typeof v === 'string')
        return v.replace(new RegExp(pattern, flags), new_);
});
nunjucks.addFilter('attrSort', function (arr, attr) {
    //Code taken from nunjucks default sort function
    // Copy it
    arr = arr.map(function (v) {
        return v;
    });

    arr.sort(function (a, b) {
        var x, y;

        if (attr) {
            x = a[attr];
            y = b[attr];
        } else {
            x = a;
            y = b;
        }
        if (x < y) {
            return -1;
        } else if (x > y) {
            return 1;
        } else {
            return 0;
        }
    });

    return arr;
});
nunjucks.addFilter("slugify", function (v) {
    return nunjucks.getFilter("replace")(nunjucks.getFilter("escape")(v), ' ', '-');
});

//
//   Launch app
//
var port = Number(process.env.PORT || 6969)
app.listen(port, function () {
    console.log('Listening on port ' + port);
});
module.exports = app;
