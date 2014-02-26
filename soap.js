var soap = require('soap'),
    extend = require('extend'),
    Q = require("q");
var classUrl = 'http://clients.mindbodyonline.com/api/0_5/ClassService.asmx?wsdl';
var staffUrl = 'http://clients.mindbodyonline.com/api/0_5/StaffService.asmx?wsdl';

module.exports = function (callback) {
    function createClient(url) {
        var d = Q.defer();
        soap.createClient(url, function (err, client) {
            var service = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
            console.log("Creating soap client for +" + service + "+");
            if (err) {
                console.log("Error creating " + service + " client.")
                d.reject(err);
            } else {
                d.resolve(client);
            }
        });
        return d.promise;
    }
    Q.all([createClient(classUrl), createClient(staffUrl)])
        .spread(function (c, s) {
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
            //Promise-ify soap client functions
            clients.q = function (client, method, args) {
                return (Q.nbind(client[method], client)(clients.setArgs(args)));
            }
            callback(clients);
        });
}