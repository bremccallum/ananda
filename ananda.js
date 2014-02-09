//Load dependencies
var express = require('express');
var app = module.exports = express();
//
//  App Settings
//
app.configure(function () {
    app.use(express.bodyParser());
    app.use("/styles", express.static(__dirname + "/styles"));
    app.use("/js", express.static(__dirname + "/js"));
    app.use('/admin', function (req, res, next) { //Do security shit here someday maybe!
        next();
    });
});
// ROUTES MUST COME AFTER THE FOLLOWING:
//    bodyParser
//    exporting app
require('./routes');
require("nunjucks").configure('views', {
    watch: true,
    autoescape: true,
    express: app
});



app.listen(6969);
console.log('Listening on port 6969');