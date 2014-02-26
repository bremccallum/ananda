var soap = require("soap");
//Load dependencies
var express = require('express'),
    moment = require("moment");
var app = module.exports = express();
//
//  App Settings
//
app.configure(function () {
    var publicDir = __dirname + "/public";
    app.use(express.bodyParser());
    app.use("/styles", express.static(publicDir + "/styles"));
    app.use("/img", express.static(publicDir + "/img"));
    app.use("/js", express.static(publicDir + "/js"));
    app.use('/admin', function (req, res, next) { //Do security shit here someday maybe!
        next();
    });
    //must come after uses
    require('./routes');
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

//
//   Launch app
//
var port = Number(process.env.PORT || 6969)
app.listen(port, function () {
    console.log('Listening on port ' + port);
});