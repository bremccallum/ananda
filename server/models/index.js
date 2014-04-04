var mongoose = require("mongoose"),
    mongoUri = process.env.CUSTOMCONNSTR_MONGOLAB_URI ||
        process.env.ANANDA_MONGO_DEV;

mongoose.connect(mongoUri);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
module.exports = {
    Users: require("./user"),
    Posts: require("./post"),
    Pages: require("./page")
}
