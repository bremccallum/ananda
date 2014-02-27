var models = require("./models"),
    extend = require("extend"),
    app = require("./ananda");
require("./soap")(function (cli) {

    var home = require("./controllers/home")(cli);
    var event = require("./controllers/event"),
        teacher = require("./controllers/teacher"),
        adminController = require("./controllers/adminController"),
        substitution = require("./controllers/substitution"),
        schedule = require("./controllers/schedule");

    app.get('/', home.landing);
    app.get('/instructors', home.instructors);
    app.get('/classes', home.classes);
    app.get('/schedule', schedule.schedule);
    app.get('/teachers', teacher.teachers);
    app.get('/teachers/:name', teacher.teacher);
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
    app.get('/admin/teacher', teacher.view);
    app.put('/admin/teacher', teacher.update);
    app.post('/admin/teacher', teacher.add);
    app.delete('/admin/teacher', teacher.remove);
    app.post('/admin/teacher/delete', teacher.remove);

    /*
======================================================================
                    EVENTS
======================================================================
*/
    app.get('/admin/event', event.view);
    app.put('/admin/event', event.update);
    app.post('/admin/event', event.add);
    app.delete('/admin/event', event.remove);
    app.post('/admin/event/delete', event.remove);


    /*
======================================================================
                    EVENTS
======================================================================
*/
    app.get('/admin/substitution', substitution.view);
    app.put('/admin/substitution', substitution.update);
    app.post('/admin/substitution', substitution.add);
    app.delete('/admin/substitution', substitution.remove);
    app.post('/admin/substitution/delete', substitution.remove);

});