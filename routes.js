var models = require("./models"),
    extend = require("extend"),
    app = require("./ananda");
require("./soap")(function (cli) {

    var homeController = require("./controllers/homeController")(cli),
        eventController = require("./controllers/eventController")(cli),
        teacherController = require("./controllers/teacherController"),
        adminController = require("./controllers/adminController"),
        substitutionController = require("./controllers/substitutionController"),
        scheduleController = require("./controllers/scheduleController");

    app.get('/', homeController.landing);
    app.get('/schedule', scheduleController.schedule);
    app.get('/teachers', teacherController.teachers);
    app.get('/classes', eventController.classes);
    app.get('/teachers/:name', teacherController.teacher);
    /* 
=========================================================================================================
          ADMIN
=========================================================================================================
*/

    /*
======================================================================
                    TEACHER
======================================================================
*/
    app.get('/admin', adminController.home);
    app.get('/admin/teacher', teacherController.view);
    app.put('/admin/teacher', teacherController.update);
    app.post('/admin/teacher', teacherController.add);
    app.delete('/admin/teacher', teacherController.remove);
    app.post('/admin/teacher/delete', teacherController.remove);

    /*
======================================================================
                    EVENTS
======================================================================
*/
    app.get('/admin/event', eventController.view);
    app.put('/admin/event', eventController.update);
    app.post('/admin/event', eventController.add);
    app.delete('/admin/event', eventController.remove);
    app.post('/admin/event/delete', eventController.remove);


    /*
======================================================================
                    EVENTS
======================================================================
*/
    app.get('/admin/substitution', substitutionController.view);
    app.put('/admin/substitution', substitutionController.update);
    app.post('/admin/substitution', substitutionController.add);
    app.delete('/admin/substitution', substitutionController.remove);
    app.post('/admin/substitution/delete', substitutionController.remove);

});