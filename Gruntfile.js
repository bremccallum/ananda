module.exports = function (grunt) {
    grunt.initConfig({
        less: {
            development: {
                files: {
                    "client/public/styles/ananda.css": "client/less/ananda.less"
                },
                cleancss: true
            }
        },
        watch: {
            files: ['./client/less/**'],
            tasks: ['less', 'cssmin']
        },
        cssmin : {
            files:{src:'client/public/styles/ananda.css', dest:'client/public/styles/ananda.min.css'}
        }
    })
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['less', 'cssmin']);
}