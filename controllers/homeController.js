var common = require('./common'),
    models = require("../models"),
    moment = require("moment");
var Page = common.Page;
var soap = require('soap');

var url = 'http://clients.mindbodyonline.com/api/0_5/ClassService.asmx?wsdl';
var now = moment();
if (now.add('minutes', -30).day() != moment().day())
    now.add('minutes', 30);
var tmrw = moment(now).add('days', 1).endOf('day');
var args = {
    'Request': {
        'SourceCredentials': {
            'SourceName': 'NovaugustWebDesign',
            'Password': '5qNInG8NEsagui9L35ujs51wz5s=',
            'SiteIDs': {
                'int': 29280
            }
        },
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
        'XMLDetail': 'Bare'
    }
};
var upcoming;
var tmrwStart = tmrw.startOf('day');
var tdayEnd = now.endOf('day');
soap.createClient(url, function (err, client) {
    client.GetClasses(args, function (err, result) {
        upcoming = {
            today: result.GetClassesResult.Classes.Class.filter(function (ele) {
                var d = moment(ele.StartDateTime);
                return d.isBefore(tmrwStart);
            }),
            tmrw: result.GetClassesResult.Classes.Class.filter(function (ele) {
                return moment(ele.StartDateTime).isAfter(now.endOf('day'));
            })
        };
    });
});

exports.landing = function (req, res) {
    var model = {};
    /*  Old event rendering
    var events = models.Event;
    var today = events.todayInt();
    var tomorrow = (today + 1) % 7;
    model.incoming = incoming.Class;
    model.pm = new Date().getHours() > 16;
    models.Event.find({
        type: "class",
        days: {
            $in: [today, tomorrow]
        }
    }).exec()
        .then(function (events) {
            function dayFilter(d) {
                return function (e) {
                    return e.days.indexOf(d) != -1;
                }
            }
            
            model.upcoming = {}
            model.upcoming.today = events.filter(dayFilter(today)).filter(function (c) {
                return !c.alreadyHappenedToday();;
            });
            model.upcoming.tomorrow = events.filter(dayFilter(tomorrow));
        }).then(render, render);*/
    res.render('landing.html', Page("Ananada Yoga", upcoming));

    function render(err) {
        res.render("landing.html", Page("Ananda Yoga", model));
    }
}