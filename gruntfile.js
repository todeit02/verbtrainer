const webpackConfig = require('./webpack.config');

module.exports = function (grunt)
{
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        shell:
        {
            npmStart: { command: 'npm start' },
            killNode: { command: 'taskkill /im node.exe /f' }
        },

        watcher:
        {
            scripts:
            {
                files: ['server/**/*.js'],
                tasks: ['shell:killNode', 'shell:npmStart'],
                options: {
                    spawn: false,
                },
            },
        },

        webpack:
        {
            prod: webpackConfig,
            dev: Object.assign({ watch: true }, webpackConfig)
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-watcher');
    grunt.loadNpmTasks('grunt-webpack');

    // Default task(s).
    grunt.registerTask('default', ['webpack:dev', 'shell:npmStart']);
};