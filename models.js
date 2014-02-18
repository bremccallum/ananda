"use strict"
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId;
var moment = require('moment');
mongoose.set("debug", true);
//Set up DB
mongoose.connect('mongodb://localhost:27017');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//**************************************
//              SCHEMA
//**************************************
//**************************************
//              Shared types
//**************************************
var singleWordNameType = {
    type: String,
    index: true,
    trim: true,
    lowercase: true,
    required: true,
    match: /^[A-Za-z]+$/
};
var teacherNameType = {
    firstName: singleWordNameType,
    lastName: singleWordNameType
};
//**************************************
//Events
//**************************************
function momentDate(v) {
    return new Date(moment(v).format('MM-DD-YYYY'));
}
var eventTypes = "class special".split(" ");
var eventSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teacher: singleWordNameType,
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: eventTypes,
        required: true
    },
    days: {
        type: [Number]
    },
    startDate: {
        type: Date,
        index: true,
        required: true,
        set: momentDate
    },
    endDate: {
        type: Date,
        index: true,
        set: momentDate
    },
    startTime: {
        type: Date,
        required: true,
        set: function (v) {
            return new Date('08-25-1988 ' + v + ' GMT-0600');
        },
        get: function (v) {
            return moment(v).format('h:mm a');
        }
    },
    length: {
        type: Number,
        min: 0,
        max: 1440
    }
});
eventSchema.index({
    startDate: 1,
    endDate: -1
});
eventSchema.methods.alreadyHappenedToday = function () {
    var result;
    var now = moment().format('h:mm a');
    //am vs pm checking

    if (this.startTime.indexOf('am') != -1 // morning class
        && now.indexOf('am') == -1) //we're in the afternoon
    {
        return true;
    } else if (now.indexOf('am') != -1 //we're in the morning
        && this.startTime.indexOf('pm') != -1) //afternoon class
    {
        return false;
    }
    //We're both am or pm, time to look at hours, correcting for 12 == 0
    var hNow, hClass;
    hNow = parseInt(now) % 12;
    hClass = parseInt(this.startTime) % 12;
    if (hNow != hClass)
        return hNow > hClass;
    else
        return false; //close enough.


}
eventSchema.statics.typesEnum = eventTypes;
eventSchema.statics.dayNames = [
'Monday',
'Tuesday',
'Wednesday',
'Thursday',
'Friday',
'Saturday',
'Sunday'];
eventSchema.statics.dayNamesShort = ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'];
eventSchema.statics.todayInt = function () {
    return (new Date().getDay() - 1) % 7;
}
//**************************************
//Substitution Schema
//**************************************
var substitutionSchema = mongoose.Schema({
    teacher: singleWordNameType, //the teacher who will be subbing
    event: {
        id: {
            type: ObjectId,
            required: true
        },
        name: String
    },
    date: {
        type: Date,
        index: true
    }
});
//**************************************
//          TEACHER
//**************************************
var teacherSchema = mongoose.Schema({
    firstName: singleWordNameType,
    lastName: singleWordNameType,
    title: String,
    bio: String,
    email: String
});
teacherSchema.path('firstName').index({
    unique: true
});
teacherSchema.index({
    firstName: 1,
    lastName: -1
});
teacherSchema.virtual('name')
    .get(function () {
        return this.firstName + ' ' + this.lastName;
    })
    .set(function (v) {
        var parts = v.split(' ');
        this.firstName = parts[0];
        this.lastName = parts[1];
    });

//**************************************
//          EXPORTS
//**************************************
module.exports = {
    Teacher: mongoose.model("Teacher", teacherSchema),
    Substitution: mongoose.model("Substitution", substitutionSchema),
    Event: mongoose.model("Event", eventSchema),
}