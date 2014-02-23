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
    app.use("/styles", express.static(__dirname + "/styles"));
    app.use("/img", express.static(__dirname + "/img"));
    app.use("/js", express.static(__dirname + "/js"));
    app.use('/admin', function (req, res, next) { //Do security shit here someday maybe!
        next();
    });
});
// ROUTES MUST COME AFTER THE FOLLOWING:
//    bodyParser
//    exporting app
require('./routes');
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
var port = Number(process.env.PORT || 5000)
app.listen(port, function () {
    console.log('Listening on port ' + port);
});