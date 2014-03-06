"use strict"
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//**************************************
//              Posts
//**************************************
var postSchema = Schema({
    slug: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true
    },
    published: Date,
    versions: [{
        date: Date,
        body: String
    }],
    created: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model("Post", postSchema);