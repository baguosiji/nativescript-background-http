module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: ["dist"],
      "api-ref": ["dist/api-ref"],
      "github.io": ["github.io/**/*.*", "!github.io/.git", "!github.io/.gitignore", "!github.io/.nojekyll"]
    },
    exec: {
      tsc_source: 'node_modules/typescript/bin/tsc -p ./source/',
      tsc_example: 'node_modules/typescript/bin/tsc -p ./examples/SimpleBackgroundHttp/',
      npm_pack: {
        cmd: 'npm pack ./package',
        cwd: 'dist/'
      },
      tns_install: {
        cmd: 'tns install',
        cwd: 'examples/SimpleBackgroundHttp'
      },
      tns_plugin_install: {
        cmd: 'tns plugin add ../../dist/package',
        cwd: 'examples/SimpleBackgroundHttp'
      },
      run_ios_emulator: {
        cmd: 'tns run ios --emulator --device iPhone-6',
        cwd: 'examples/SimpleBackgroundHttp'
      },
      build_ios_emulator: {
        cmd: 'tns build ios --emulator',
        cwd: 'examples/SimpleBackgroundHttp'
      },
      run_android_emulator: {
        cmd: 'tns run android --emulator',
        cwd: 'examples/SimpleBackgroundHttp'
      },
      tsd_link: {
        cmd: 'tsd link',
        cwd: 'examples/SimpleBackgroundHttp'
      },
    },
    typedoc: {
      "api-ref": {
        options: {
          // 'flag:undefined' will set flags without options.
          module: 'commonjs',
          target: 'es5',
          out: './dist/api-ref/',
          json: './dist/doc.json',
          name: 'Background HTTP for NativeScript',
          includeDeclarations: undefined, 
          hideGenerator: undefined,
          excludeExternals: undefined,
          externalPattern: '**/d.ts/**',
          mode: 'file',
          readme: 'source/README.md',
          entryPoint: '"nativescript-background-http"'
          // verbose: undefined
        },
        src: ['source/background-http.d.ts', 'source/d.ts/data/observable/observable.d.ts']
      }
    },
    copy: {
      package: {
        files: [
          { expand: true, cwd: 'source', src: ['**/*.js', '**/*.xml', '**/*.jar', './*.d.ts', 'package.json', 'README.md', 'imagepicker.d.ts'], dest: 'dist/package' }
        ]
      },
      "github.io": {
      	files: [
		      { expand: true, cwd: 'dist/api-ref', src: ['**/*'], dest: 'github.io' }
      	]
      }
    },
    mkdir: {
      dist: {
        options: {
          create: ["dist/package"]
        }
      }
    },
    mochaAppium: {
      options: {
        reporter: 'spec',
        timeout: 30e3,
        usePromises: true,
        appiumPath: 'appium'
      },
      'iPhone-6 Sim': {
        src: ['tests/automation/*.js'],
        options: {
          platformName: 'iOS',
          version: '8.3',
          deviceName: 'iPhone 6 - 8.3',
          app: __dirname + '/examples/SimpleBackgroundHttp/platforms/ios/build/emulator/SimpleBackgroundHttp.app'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-typedoc');
  grunt.loadNpmTasks('grunt-mocha-appium');

  grunt.registerTask('http-dev', 'Host handle uploads.', function() {
    var serv = require('./examples/www/server');
    var done = this.async();
    var server = serv.start(8083, console);
  });
  
  // Default task(s).
  grunt.registerTask('default', [
    'clean:dist',
    'exec:tsc_source',
    'mkdir:dist',
    'copy:package',
    'exec:npm_pack',
    'exec:tns_install',
    'exec:tns_plugin_install',
    'exec:tsd_link',
    'exec:tsc_example'
  ]);

  grunt.registerTask('ios', [
    'default',
    'exec:run_ios_emulator'
  ]);

  grunt.registerTask('android', [
    'default',
    'exec:run_android_emulator'
  ]);

  grunt.registerTask('github.io', [
  	'clean:api-ref',
  	'clean:github.io',
  	'typedoc:api-ref',
  	'copy:github.io'
  ]);

  grunt.registerTask('tests', [
    'default',
    'exec:build_ios_emulator',
    'mochaAppium:iPhone-6 Sim'
  ])
};
