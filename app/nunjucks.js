var nunjucks = require("nunjucks"),
    moment = require('moment'),
    downsize = require('downsize'),
    _ = require('lodash');

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
        if (_.isString(v)) {
            return v.replace(new RegExp(pattern, flags), new_);
        }
    });
    nunjucks.addFilter('attrSort', function (arr, attr) {
        if(!_.isArray(arr)) {
            return undefined;
        }
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
    nunjucks.addFilter('excerpt', function (v, numWords) {
        numWords = numWords ? numWords : 50;
        return v ? downsize(v.replace(/<\/?[^>]+>/gi, ' '), {
            words: numWords
        }) : v;
    });
    nunjucks.addFilter("slugify", function (v) {
        if (!v) {
            return v;
        }
        return nunjucks.getFilter("replace")(nunjucks.getFilter("escape")(v), ' ', '-');
    });
    return nunjucks;
};

module.exports = nunjucksInit;
