module.exports = function (grunt) {
    grunt.initConfig({
        less: {
            development: {
                files: {
                    "public/styles/ananda.css": "less/ananda.less"
                },
                cleancss: true
            }
        },
        watch: {
            files: './less/*',
            tasks: ['less', 'cssmin']
        },
        cssmin : {
            files:{src:'public/styles/ananda.css', dest:'public/styles/ananda.min.css'}
        }
    })
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['less', 'cssmin']);
}