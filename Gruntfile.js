module.exports = function (grunt) {
    'use strict';
    grunt.util.linefeed = '\n';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            src: "src",
            dist: "dist",
            txt: "txt",
            demo: "demo",
            filename: "jquery.imeenter"
        },
        clean: {
            dist: {
                files: [{
                        dot: true,
                        src: ['<%= meta.dist %>/*.js']
                    }]
            }
        },
        replace: {
            readme: {
                src: '<%= meta.txt %>/read.txt',
                dest: 'README.md',
                replacements: [{
                        from: /<version>/g,
                        to: '<%= pkg.version %>'
                    }]
            },
            bower: {
                src: '<%= meta.txt %>/bower.txt',
                dest: 'bower.json',
                replacements: [{
                        from: /<version>/g,
                        to: '<%= pkg.version %>'
                    }]
            },
            main: {
                src: '<%= meta.src %>/<%= meta.filename %>.js',
                dest: '<%= meta.dist %>/<%= meta.filename %>.js',
                replacements: [
                    {
                        from: /<pkg\.version>/g,
                        to: '<%= pkg.version %>'
                    },
                    {
                        from: /<pkg\.name>/g,
                        to: '<%= pkg.name %>'
                    },
                    {
                        from: /<pkg\.homepage>/g,
                        to: '<%= pkg.homepage %>'
                    },
                    {
                        from: /<pkg\.author\.name>/g,
                        to: '<%= pkg.author.name %>'
                    },
                    {
                        from: /<pkg\.author\.url>/g,
                        to: '<%= pkg.author.url %>'
                    },
                    {
                        from: /<pkg\.license\.type>/g,
                        to: '<%= pkg.license.type %>'
                    },
                    {
                        from: /<pkg\.license\.url>/g,
                        to: '<%= pkg.license.url %>'
                    }
                ]
            }
        },
        uglify: {
            main: {
                options: {
                    preserveComments: 'some'
                },
                src: '<%= replace.main.dest %>',
                dest: '<%= meta.dist %>/<%= meta.filename %>.min.js'
            }
        },
        jshint: {
            files: [
                'Gruntfile.js',
                'package.json',
                'bower.json',
                '.jshint*',
                '<%= meta.src %>/*.js',
                '<%= meta.dist %>/<%= meta.filename %>.js'
            ],
            options: {
                loopfunc: true
            }
        },
        watch: {
            js: {
                spawn: false,
                files: [
                    'Gruntfile.js',
                    'package.json',
                    'bower.json',
                    '<%= meta.src %>/*.js',
                    '<%= meta.txt %>/*'
                ],
                tasks: [
                    'clean',
                    'replace',
                    'uglify',
                    'jshint'
                ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['clean', 'replace', 'uglify']);
};