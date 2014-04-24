var nunjucks = require('./nunjucks'),
    cache = require('./cache'),
    CACHE_TIME = 1000 * 60 * 60; //1 hour

var cacheInit = function (app) {
    // @TODO make cache work with etag
    app.disable("etag");
    app.use('/', cache(CACHE_TIME, '/'));
    app.use('/instructors', cache(CACHE_TIME, '/instructors'));
    app.use('/classes', cache(CACHE_TIME, '/classes'));
    app.use('/schedule', cache(CACHE_TIME, '/schedule'));
    app.use('/workshops', cache(CACHE_TIME, '/workshops'));
}

var routesInit = function () {
    require('./routes');
}
var dataInit = function () {
    require("./models");
}

module.exports.initialize = function (app) {
    nunjucks(app);
    dataInit();
    cacheInit(app);
    routesInit();
}
