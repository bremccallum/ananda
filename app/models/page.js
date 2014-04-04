"use strict"
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//**************************************
//              Posts
//**************************************
var pageSchema = Schema({
    page: {
        type: String,
        required: true,
        index: true
    },
    image: {
        type: String
    },
    heading: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
});
module.exports = mongoose.model("Page", pageSchema);
