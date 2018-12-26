function defineLintScripts(configs, ci) {
  return {
    ...configs.remark && {'lint:md': 'remark . --frail'},
    'lint:js': 'eslint . --cache',
    ...('Travis' === ci) && {'lint:travis': 'travis-lint .travis.yml'},
    'lint:sensitive': 'ban'
  };
}

function defineTestScripts(tests, visibility) {
  return {
    ...tests.unit && {
      'test:unit:base': 'mocha --recursive test/unit',
      'test:unit': 'nyc run-s test:unit:base'
    },
    ...tests.integration && {'test:integration': 'cucumber-js test/integration --require-module @babel/register --format-options \'{"snippetInterface": "async-await"}\''},     // eslint-disable-line max-len
    ...tests.unit && ('Public' === visibility) && {
      'coverage:report': 'nyc report --reporter=text-lcov > coverage.lcov && codecov'
    }
  };
}

function definePackageBuildScripts() {
  return {
    clean: 'rimraf lib/',
    build: 'run-s clean build:*',
    'build:js': 'rollup -c',
    watch: 'run-s \'build:js -- --watch\'',
    prepack: 'run-s build'
  };
}

function defineScripts(packageType, configs, ci, tests, visibility) {
  return {
    ...defineLintScripts(configs, ci),
    ...defineTestScripts(tests, visibility),
    test: `npm-run-all --print-label --parallel lint:*${(tests.unit || tests.integration) ? ' --parallel test:*' : ''}`,

    ...('Application' === packageType) && {start: './lib/index.js'},
    ...('Package' === packageType) && definePackageBuildScripts(),

    ...'Private' === visibility && {
      'greenkeeper:update-lockfile': 'greenkeeper-lockfile-update',
      'greenkeeper:upload-lockfile': 'greenkeeper-lockfile-upload'
    }
  };
}

function defineHostDetails(vcs, packageType, packageName) {
  return ('GitHub' === vcs.host) && {
    repository: `${vcs.owner}/${vcs.name}`,
    bugs: `https://github.com/${vcs.owner}/${vcs.name}/issues`,
    homepage: ('Package' === packageType)
      ? `https://npm.im/${packageName}`
      : `https://github.com/${vcs.owner}/${vcs.name}#readme`
  };
}

function definePackagingDetails(visibility) {
  return {
    version: '0.0.0-semantically-released',
    main: 'lib/index.cjs.js',
    module: 'lib/index.es.js',
    publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'},
    files: ['lib/']
  };
}

export default function ({
  projectName,
  visibility,
  scope,
  packageType,
  license,
  tests,
  vcs,
  author,
  ci,
  description,
  configs
}) {
  const packageName = `${scope ? `@${scope}/` : ''}${projectName}`;

  return {
    name: packageName,
    description,
    license,
    ...('Package' === packageType) && definePackagingDetails(visibility),
    ...('Application' === packageType) && {private: true},
    ...defineHostDetails(vcs, packageType, packageName),
    author: `${author.name}${author.email ? ` <${author.email}>` : ''}${author.url ? ` (${author.url})` : ''}`,
    scripts: defineScripts(packageType, configs, ci, tests, visibility)
  };
}
