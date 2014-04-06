var cache = require('./cache'),
    nunjucks = require('nunjucks'),
    moment = require('moment');
var nunjucksInit = function (app) {
    nunjucks = nunjucks.configure('client/views', {
        watch: true,
        autoescape: true,
        express: app
    });
    nunjucks.addFilter('prettyDate', function (v) {
        return (moment(v).format("M/DD/YY"));
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
        if(!v){ return v; }
        return nunjucks.getFilter("replace")(nunjucks.getFilter("escape")(v), ' ', '-');
    });
}
var cacheInit = function(app) {
    cache = require('./cache'),

    CACHE_TIME = 1000 * 60 * 30;
    app.disable("etag");
    app.use('/', cache(CACHE_TIME, '/'));
    app.use('/instructors', cache(CACHE_TIME, '/instructors'));
    app.use('/classes', cache(CACHE_TIME, '/classes'));
    app.use('/schedule', cache(CACHE_TIME, '/schedule'));
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
    nunjucksInit(app);
    dataInit();
    cacheInit(app);
    routesInit(app);

}
