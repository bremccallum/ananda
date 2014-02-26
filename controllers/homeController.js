var common = require('./common'),
    models = require("../models"),
    moment = require("moment");
var Page = common.Page,
    Q = common.Q;
module.exports = function (soap) {
    function landing(req, res) {
        var now = moment();
        if (now.add('minutes', -30).day() != moment().day())
            now.add('minutes', 30);
        var tmrw = moment(now).add('days', 1).endOf('day');
        var args = {
            Fields: [
                {
                    string: 'Classes.ClassDescription.Name'
                    },
                {
                    string: 'Classes.StartDateTime'
                    },
                {
                    string: 'Classes.Staff.Name'
                    }
                ],
            StartDateTime: now.format('YYYY-MM-DD[T]HH:mm:ss'),
            EndDateTime: tmrw.format('YYYY-MM-DD[T]HH:mm:ss'),
            SchedulingWindow: true,
            XMLDetail: 'Bare'
        };
        var tmrwStart = tmrw.startOf('day');
        var tdayEnd = now.endOf('day');
        //get classes
        soap.q(soap.Classes, 'GetClasses', args)
            .done(function (result) {
                var classes = result[0].GetClassesResult.Classes.Class;
                var model = {
                    today: classes.filter(function (ele) {
                        var d = moment(ele.StartDateTime);
                        return d.isBefore(tmrwStart);
                    }),
                    tmrw: classes.filter(function (ele) {
                        return moment(ele.StartDateTime).isAfter(now.endOf('day'));
                    })
                };
                model.pm = now.hours() >= 16;
                res.render('landing.html', Page("Ananada Yoga", model));

            });
    }
    var out = {};
    out.landing = landing;
    return out;
}