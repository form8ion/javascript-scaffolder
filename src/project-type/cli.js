const defaultBuildDirectory = './bin';

export default function () {
  return {
    scripts: {
      clean: `rimraf ${defaultBuildDirectory}`,
      prebuild: 'run-s clean',
      build: 'npm-run-all --print-label --parallel build:*',
      'build:js': 'rollup --config',
      watch: 'run-s \'build:js -- --watch\'',
      prepack: 'run-s build'
    },
    dependencies: ['update-notifier'],
    devDependencies: [
      'rimraf',
      'rollup',
      'rollup-plugin-auto-external',
      'rollup-plugin-executable',
      'rollup-plugin-json'
    ],
    vcsIgnore: {files: [], directories: ['/bin/']},
    buildDirectory: defaultBuildDirectory
  };
}
