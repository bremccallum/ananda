"use strict"
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId;
var moment = require('moment');
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://anandaDB:ananda1@ds033499.mongolab.com:33499/heroku_app22472794';
//Set up DB
mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var requiredString = {type: String, required:true};
//**************************************
//              Posts
//**************************************
var postSchema = mongoose.Schema({
    title: requiredString,
    slug: requiredString,
    author: requiredString,
    published: Date,
    updated: [Date],
    created: {type:Date, default:Date.now},
    body: requiredString
})
//**************************************
//          EXPORTS
//**************************************
module.exports = {
    Post: mongoose.model("Post", postSchema)
}