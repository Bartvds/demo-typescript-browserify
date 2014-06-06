/*jshint newcap: false*/
module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	var browserify = require('browserify');
	var exorcist = require('exorcist');

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-ts');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			dist: [
				'dist/**/*'
			],
			tmp: [
				'tmp/**/*'
			]
		},
		ts: {
			options: {
				fast: 'never',
				target: 'es5',
				module: 'commonjs',
				// sourceRoot: './src',
				sourceMap: true
			},
			index: {
				src: ['./src/index.ts'],
				outDir: './tmp'
			}
		},
		bundle: {
			index: {
				main: './tmp/index.js',
				bundle: './dist/index.js'
			}
		}
	});

	// setup main aliases
	grunt.registerTask('default', ['build']);

	grunt.registerTask('build', [
		'clean',
		'ts:index',
		'bundle:index'
	]);

	// custom browserify multi-task
	grunt.registerMultiTask('bundle', function () {
		var done = this.async();

		var mainFile = this.data.main;
		var bundleFile = this.data.bundle;
		var mapFile = bundleFile + '.map';

		// make sure we have the directory (fs-stream is naive)
		grunt.file.mkdir(path.dirname(bundleFile));

		//setup stream
		var bundle = new browserify();
		bundle.add(mainFile);

		var stream = bundle.bundle({
			debug: true
		}, function (err) {
			if (err) {
				grunt.log.error(mainFile);
				console.log(err);
				done(false);
			}
			else {
				grunt.log.writeln('>> '.white + mainFile);
				grunt.log.ok(bundleFile);
				done();
			}
		});
		// split source-map to own file
		stream = stream.pipe(exorcist(mapFile));
		stream.pipe(fs.createWriteStream(bundleFile));
	});
};
