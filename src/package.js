export default function ({projectName, visibility, scope, packageType, license, tests, vcs, author, ci, description}) {
  const packageName = `${scope ? `@${scope}/` : ''}${projectName}`;

  return {
    name: packageName,
    description,
    ...('Package' === packageType) && {
      version: '0.0.0-semantically-released',
      main: 'lib/index.cjs.js',
      module: 'lib/index.es.js'
    },
    license,
    ...('Application' === packageType) && {private: true},
    ...('GitHub' === vcs.host) && {
      repository: `${vcs.owner}/${vcs.name}`,
      bugs: `https://github.com/${vcs.owner}/${vcs.name}/issues`,
      homepage: ('Package' === packageType)
        ? `https://npm.im/${packageName}`
        : `https://github.com/${vcs.owner}/${vcs.name}#readme`
    },
    author: `${author.name} <${author.email}> (${author.url})`,
    scripts: {
      ...('Package' === packageType) && {clean: 'rimraf lib/'},
      ...('Application' === packageType) && {start: './lib/index.js'},
      'lint:js': 'eslint . --cache',
      ...('Travis' === ci) && {'lint:travis': 'travis-lint .travis.yml'},
      'lint:sensitive': 'ban',
      test: `run-s lint:*${(tests.unit || tests.integration) ? ' test:*' : ''}`,
      ...tests.unit && {
        'test:unit:base': 'mocha --recursive test/unit',
        'test:unit': 'nyc run-s test:unit:base'
      },
      ...tests.integration && {'test:integration': 'cucumber-js test/integration --require-module babel-register --format-options \'{"snippetInterface": "async-await"}\''},     // eslint-disable-line max-len
      ...tests.unit && ('Public' === visibility) && {
        'coverage:report': 'nyc report --reporter=text-lcov > coverage.lcov && codecov'
      },
      ...('Package' === packageType) && {
        build: 'run-s clean build:*',
        'build:js': 'rollup -c',
        watch: 'run-s \'build:js -- --watch\'',
        prepublishOnly: 'run-s build'
      },
      'greenkeeper:update-lockfile': 'greenkeeper-lockfile-update',
      'greenkeeper:upload-lockfile': 'greenkeeper-lockfile-upload'
    },
    ...('Package' === packageType) && {publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'}},
    config: {
      commitizen: {
        path: './node_modules/cz-conventional-changelog'
      }
    }
  };
}
