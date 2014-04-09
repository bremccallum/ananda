var nunjucks = require('./nunjucks'),
    cache = require('./cache');

var cacheInit = function (app) {
    var CACHE_TIME = 1000 * 60 * 60; //1 hour

    app.disable("etag");
    app.use('/', cache(CACHE_TIME, '/'));
    app.use('/instructors', cache(CACHE_TIME, '/instructors'));
    app.use('/classes', cache(CACHE_TIME, '/classes'));
    app.use('/schedule', cache(CACHE_TIME, '/schedule'));
    app.use('/workshops', cache(CACHE_TIME, '/workshops'));
}

var routesInit = function (app) {
    var loadRoutes = require('./routes'),
        loadSoap = require('./soap');
    loadSoap(loadRoutes.bind(null, app));
}
var dataInit = function () {
    require("./models");
}

module.exports.initialize = function (app) {
    nunjucks(app);
    dataInit();
    cacheInit(app);
    routesInit(app);

}
