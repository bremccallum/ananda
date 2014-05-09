var soap = require('soap-q')(),
    _ = require('lodash'),
    Q = require('q'),
    moment = require('moment'),
    

    DateFormat = 'YYYY-MM-DD[T]HH:mm:ss',
    MboApiClient = {},
    MboPassword = process.env.MBO_PASSWORD,
    WORKSHOPS_ID = 27;

if (process.env.NODE_ENV === "development") {
    Q.longStackSupport = true;
}

function initializeClient() {
    var deferred = Q.defer(),

        //## Request Constructors
        authenticateRequest = function (args) {
            var credentials = {
                SourceCredentials: {
                    'SourceName': 'NovaugustWebDesign',
                    'Password': MboPassword,
                    'SiteIDs': {
                        'int': 29280
                    }
                }
            };
            return {
                Request: _.assign(credentials, args)
            };
        },

        CreateClassRequest = function (start, end, programID, detailed) {
            var args = {
                Fields: [
                    {
                        string: 'Classes.ClassDescription.Name'
                    },
                    {
                        string: 'Classes.StartDateTime'
                    },
                    {
                        string: 'Classes.Substitute'
                    },
                    {
                        string: 'Classes.Staff.Name'
                    },
                    {
                        string: 'Classes.ClassDescription.Program.ID'
                    },
                    {
                        string: 'Classes.IsCanceled'
                    }
                ],
                StartDateTime: start.format(DateFormat),
                EndDateTime: end.format(DateFormat),
                SchedulingWindow: true,
                XMLDetail: 'Bare'
            };
            if (programID) {
                args.ProgramIDs = [{
                    int: programID
                }];
            }
            if (detailed) {
                args.Fields.push({
                    string: 'Classes.ClassDescription.ImageURL'
                });
                args.Fields.push({
                    string: 'Classes.ClassDescription.Description'
                });
                args.Fields.push({
                    string: 'Classes.EndDateTime'
                });
            }
            return authenticateRequest(args);
        };

    //## Staff

    MboApiClient.GetStaff = function () {
        var args = authenticateRequest({
            Fields: [
                {
                    string: 'Staff.Bio'
                }, {
                    string: 'Staff.ImageURL'
                }, {
                    string: 'Staff.Email'
                }, {
                    string: 'Staff.Name'
                }
            ],
            XMLDetail: 'Bare'
        });
        return this.StaffClient.GetStaffQ(args).then(function (rawStaff) {
            //Extract staff
            var cleanedStaff = rawStaff.GetStaffResult.StaffMembers.Staff;

            //Filter test data
            cleanedStaff = _.filter(cleanedStaff, function (staff) {
                return staff.ID > 1;
            });

            //Standardize data
            cleanedStaff = _.map(cleanedStaff, function (staff) {
                return {
                    Name: staff.Name,
                    Email: staff.Email,
                    ImageURL: staff.ImageURL,
                    Description: (_.isEmpty(staff.Bio)) ? '' : staff.Bio
                };
            });

            return cleanedStaff;
        });
    };

    // ## Classes

    MboApiClient.GetClasses = function (options) {
        var args = CreateClassRequest(options.start, options.end, options.programID, options.detailed);
        return this.ClassClient.GetClassesQ(args).then(function (rawClasses) {
            var cleanedClasses;
            if ('0' === rawClasses.GetClassesResult.ResultCount) {
                cleanedClasses = [];
            } else {
                cleanedClasses = rawClasses.GetClassesResult.Classes.Class;
                //If there's only one class, put it in an array.
                if (!_.isArray(cleanedClasses)) {
                    cleanedClasses = [cleanedClasses];
                }
            }
            //mark workshops in a mixed class result
            if (_.isUndefined(options.programID)) {
                cleanedClasses = _.map(cleanedClasses, function (c) {
                    c.isWorkshop = c.ClassDescription.Program.ID == WORKSHOPS_ID;
                    c.isSubstitute = c.Substitute === "true";
                    c.isCancelled = c.IsCanceled === "true";
                    return c;
                });
            }
            return cleanedClasses;
        });
    };

    // ## Workshops

    function Workshop(mboWorkshop) {
        this.id = mboWorkshop.ClassDescription.ID;
        this.date = mboWorkshop.StartDateTime;
        this.name = mboWorkshop.ClassDescription.Name;
        this.teacher = mboWorkshop.Staff.Name;
        this.image = mboWorkshop.ClassDescription.ImageURL;
        this.start = mboWorkshop.StartDateTime;
        this.end = mboWorkshop.EndDateTime;
        //empty descriptions appear as objects.
        this.description = mboWorkshop.ClassDescription.Description;
        if (_.isUndefined(this.description) || _.isObject(this.description)) {
            this.description = '';
        }
    }

    MboApiClient.GetWorkshops = function (options) {
        options = options || {};
        options.start = moment().add('days', -1);
        options.end = moment().add('months', 2);
        options.programID = WORKSHOPS_ID;
        return this.GetClasses(options).then(function (workshops) {
            workshops = _.map(workshops, function (workshop) {
                return new Workshop(workshop);
            });
            return workshops;
        });
    };

    //Create the clients and return the MboApiClient
    Q.all([
        soap.createClientQ('./app/soap/ClassService.wsdl'),
        soap.createClientQ('./app/soap/StaffService.wsdl')
    ]).spread(function (c, s) {
        MboApiClient.ClassClient = c;
        MboApiClient.StaffClient = s;
        deferred.resolve(MboApiClient);
    }).fail(function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
}

module.exports = function () {
    if (_.isEmpty(MboApiClient)) {
        return initializeClient();
    } else {
        return Q.when(MboApiClient);
    }
};
