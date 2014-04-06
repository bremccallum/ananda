var soap = require('soap-q')(),
    _ = require('lodash'),
    Q = require('q');

if (process.env.NODE_ENV === "development") {
    Q.longStackSupport = true;
}

module.exports = function (callback) {
    var classUrl = __dirname + '/ClassService.wsdl';
    var staffUrl = __dirname + '/StaffService.wsdl';
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
                    Request: _.assign({
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
            clients.cleanClasses = function (rawClasses) {
                var cleanedClasses;
                if (0 == rawClasses.GetClassesResult.ResultCount)
                    cleanedClasses = [];
                else {
                    cleanedClasses = rawClasses.GetClassesResult.Classes.Class;
                    if (cleanedClasses.length === undefined) { //only one class
                        cleanedClasses = [cleanedClasses];
                    }
                }
                return cleanedClasses;
            };
            callback(clients);
        }).fail(function (err) {
            console.error(err);
            throw err;
        });
};
