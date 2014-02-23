  var soap = require('soap');
  var url = 'http://clients.mindbodyonline.com/api/0_5/ClassService.asmx?wsdl';
  var args = {
      'Request': {
          'SourceCredentials': {
              'SourceName': 'NovaugustWebDesign',
              'Password': '5qNInG8NEsagui9L35ujs51wz5s=',
              'SiteIDs': {
                  'int': 29280
              }
          },
          'Fields': {
              'string': 'Classes.ClassDescription.Name',
              'string': 'Classes.StartDateTime',
              'string': 'Classes.EndDateTime'
          },
          StartDateTime: '2014-02-23',
          EndDateTime: '2014-02-24',
          SchedulingWindow: true,
          'XMLDetail': 'Bare'
      }
  };
  soap.createClient(url, function (err, client) {
      client.GetClasses(args, function (err, result) {
          module.exports = result.GetClassesResult.Classes;
      });
  });