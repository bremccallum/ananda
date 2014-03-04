var soap = require("soap");
//Load dependencies
var express = require('express'),
    moment = require("moment");
var app = module.exports = express();
//
//  App Settings
//
app.configure(function () {
    app.use(express.bodyParser());
    /*app.use('/admin', function (req, res, next) { //Do security shit here someday maybe!
        next();
    });*/
    require('./routes');
    app.use(express.static(__dirname + "/public"));
});
//
//   Templating
//
var nunjucks = require("nunjucks").configure('views', {
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
nunjucks.addFilter("regexReplace", function(v, pattern, flags, new_){
    if(typeof v === 'string')
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
})

//
//   Launch app at port 6969
//
var port = Number(process.env.PORT || 6969)
app.listen(port, function () {
    console.log('Listening on port ' + port);
});