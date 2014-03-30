var Pages = require("mongoose-q")().model('Page'),
    Q = require('q');

//get
function edit(req, res) {
    var page = req.params.page;
    Pages.findOne({
        page: page
    }, function (err, page) {
        res.render('/admin/page', err || page);
    });
}

function update(req, res) {
    var page = req.body.page;
    Pages.update({
        page: page
    }, {
        heading: req.body.heading,
        image: req.body.image,
        body: req.body.body
    }, function (err) {
        res.send(err || {
            success: true
        })
    });
}

exports.edit = edit;
exports.update = update;
