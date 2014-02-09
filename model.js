"use strict"
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId;
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
var eventTypes = "class special".split(" ");
var eventSchema = mongoose.Schema({
    name: String,
    teacher: teacherNameType,
    description: String,
    type: {
        type: String,
        enum: eventTypes
    },
    days: {
        type: [Number]
    },
    startDate: {
        type: Date,
        index: true
    },
    endDate: {
        type: Date,
        index: true
    },
    startTime: Date,
    endTime: Date
});
eventSchema.index({
    startDate: 1,
    endDate: -1
});
//**************************************
//Substitution Schema
//**************************************
var substitutionSchema = mongoose.Schema({
    teacher: teacherNameType, //the teacher who will be subbing
    event: ObjectId,
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
    lastName: 1,
    firstName: -1
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