var cache = module.exports = function (app) {
    app._cache = {};

    return function (milliseconds, myRoute) {
        myRoute = myRoute.toLowerCase();
        return function (req, res, next) {
            var route = req.originalUrl;
            //reasons to bail
            if ('GET' != req.method || route.toLowerCase() != myRoute || req.query.nocache) {
                return next();
            }
            //Send cached version
            if (app._cache[route] && (app._cache[route].expires > Date.now())) {
                console.log("CACHE: HIT:" + route);
                res.send(app._cache[route].data);
                return true;
            }
            //Monkey patch to create cache
            var end = res.end;
            res.end = function (data, encryption) {
                res.end = end;
                if(!data.length){
                    //shouldn't happen as long as etag is disabled
                    console.log("CACHE: !ERROR! no data:" + myRoute);
                }
                else if(res.statusCode >=300){
                    console.log("CACHE: Abort Cache: " + myRoute + " - " + res.statusCode);
                }
                else{
                    res.on('finish', function () {
                        console.log("CACHE: SAVING:'" + route);
                        app._cache[route] = {
                            data: data,
                            expires: Date.now() + milliseconds
                        };
                    });
                }
                res.end(data, encryption);
            }
            return next();
        }
    }
}
