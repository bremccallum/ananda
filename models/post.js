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
    versions: {
        type: [{
            date: Date,
            body: String
    }],
        select: false
    },
    created: {
        type: Date,
        default: Date.now,
        select: false
    }
})
postSchema.pre('save', function (next) {
    if (this.isModified("body")) {
        this.modified = Date.now;
    }
    next();
});
module.exports = mongoose.model("Post", postSchema);