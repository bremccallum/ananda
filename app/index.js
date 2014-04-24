module.exports.initialize = function (app) {
    require('./nunjucks')(app);
    require('./models');
    require('./routes');
};
