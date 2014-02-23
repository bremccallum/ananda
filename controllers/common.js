var extend = require("extend"),
    app = require("../ananda");

exports.Page = function (title, model) {
    var o = {
        title: title,
        prod: process.env.NODE_ENV === "production",
    }
    extend(o, model);
    return o;
};
exports.handleKey = function (key, res, redirect, error) {
    if (!key) {
        if (req.xhr) {
            res.redirect(redirect.replace("{{key}}", key));
        } else {
            res.send({
                error: error.replace("{{key}}", key)
            })
        }
    }
    return key;
};
exports.titleCase = function (s) {
    var a = s.split(" ");
    a.forEach(function (s, i, a) {
        a[i] = s.charAt(0) + s.slice(1);
    });
    return a.join(" ");
};