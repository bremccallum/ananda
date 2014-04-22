var moment = require('moment');

module.exports = function (m) {
    return moment(m).zone(360);
}