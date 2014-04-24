var app = require('../ananda'),
    //one hour
    CACHE_TIME = 1000*60*60;

app._cache = {};

module.exports = function (req, res, next) {
    //reasons to bail
    if (req.query.nocache) {
        return next();
    }
    //Send cached version
    if (app._cache[req.path] && (app._cache[req.path].expires > Date.now())) {
        console.log("CACHE: HIT:" + req.path);
        res.send(app._cache[req.path].data);
        return true;
    }
    //Monkey patch to create cache
    var end = res.end;
    res.end = function (data, encryption) {
        res.end = end;
        if (!data.length) {
            //shouldn't happen as long as etag is disabled
            console.log("CACHE: !ERROR! no data:" + req.path);
        } else if (res.statusCode >= 300) {
            console.log("CACHE: Abort Cache: " + req.path + " - " + res.statusCode);
        } else {
            res.on('finish', function () {
                console.log("CACHE: SAVING:" + req.path);
                app._cache[req.path] = {
                    data: data,
                    expires: Date.now() + CACHE_TIME
                };
            });
        }
        res.end(data, encryption);
    };
    return next();
};
module.exports.reset = function(req, res, next) {
    app._cache = {};
    return next();
};
