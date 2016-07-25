module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
        	dist: 'build'
        },
    	packageModules: {
        	dist: {
          		src: 'package.json',
          		dest: 'build/'
        	}
    	},
    	copy: {
        	dist: {
            	files: [
                	{expand: true, cwd: 'src/js', src:'**', dest: 'build/bin/'},
                	{expand: true, cwd: 'src/resources', src:'**', dest: 'build/resources/'},
            	]
        	}
        },
        compress: {
        	dist: {
        		options: {
        			archive: '<%= pkg.name %>_<%= grunt.template.today("yyyy-mm-dd") %>.zip'
        		},
        		expand: true,
    			cwd: 'build/',
    			src: ['**/*'],
    			dest: ''
        	}
        }
	});

	grunt.loadNpmTasks('grunt-npm-install');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-package-modules');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');


	grunt.registerTask('default', ['npm-install']);
	grunt.registerTask('build', ['clean:dist','npm-install', 'copy:dist', 'packageModules:dist',"compress:dist"]);
};