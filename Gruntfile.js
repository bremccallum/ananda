module.exports = function (grunt) {
    grunt.initConfig({
        less: {
            development: {
                files: {
                    "public/styles/ananda.css": "less/ananda.less"
                }
            }
        },
        watch:{
            files:'./less/*',
            tasks:['less']
        }
    })
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['less', 'watch']);
}