var extend = require("extend"),
    app = require("../ananda");
exports.Q = require('q');
exports.Page = function (title, model) {
    var o = {
        title: title,
        prod: process.env.NODE_ENV === "production",
    }
    extend(o, model);
    return o;
};