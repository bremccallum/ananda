module.exports = function (grunt) {
    grunt.initConfig({
        less: {
            development: {
                files: {
                    "public/styles/ananda.css": "views/less/ananda.less"
                }
            }
        },
        watch:{
            files:'./views/less/*',
            tasks:['less']
        }
    })
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['less', 'watch']);
}