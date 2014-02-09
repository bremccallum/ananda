exports.titleCase = function (s) {
    var a = s.split(" ");
    a.forEach(function (s, i, a) {
        a[i] = s.charAt(0) + s.slice(1);
    });
    return a.join(" ");
};