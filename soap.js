var soap = require('soap-q')(),
    extend = require('extend'),
    Q = require("q");
var classUrl = __dirname + '/controllers/soap/ClassService.wsdl';
var staffUrl = __dirname + '/controllers/soap/StaffService.wsdl';

module.exports = function (callback) {
    if (process.env.NODE_ENV === "development") {
        Q.longStackSupport = true;
    }
    Q.all([soap.createClientQ(classUrl), soap.createClientQ(staffUrl)])
        .spread(function (c, s) {
            console.log("SOAP initialized.")
            var clients = {
                Classes: c,
                Staff: s,
                DateFormat: 'YYYY-MM-DD[T]HH:mm:ss'
            };
            clients.setArgs = function (args) {
                return {
                    Request: extend({
                            SourceCredentials: {
                                'SourceName': 'NovaugustWebDesign',
                                'Password': '5qNInG8NEsagui9L35ujs51wz5s=',
                                'SiteIDs': {
                                    'int': 29280
                                }
                            }
                        },
                        args)
                };
            };
            callback(clients);
        }).fail(function (err) {
            console.error(err);
            throw err;
        });
};
