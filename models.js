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
    slug: {type:String, required:true, index:true, unique:true},
    title: requiredString,
    author: requiredString,
    body: requiredString,
    isPublished: {type:Boolean, default:false},
    published: Date,
    versions: [{date:Date, body:String}],
    created: {type:Date, default:Date.now}
})
//**************************************
//          EXPORTS
//**************************************
module.exports = {
    Post: mongoose.model("Post", postSchema)
}