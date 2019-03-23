function definePackageBuildScripts() {
  return {
    clean: 'rimraf lib/',
    build: 'run-s clean build:*',
    'build:js': 'rollup -c',
    watch: 'run-s \'build:js -- --watch\'',
    prepack: 'run-s build'
  };
}

function defineScripts(packageType, configs, ci, tests, contributors, vcs) {
  return {
    test: `npm-run-all --print-label --parallel lint:*${(tests.unit || tests.integration) ? ' --parallel test:*' : ''}`,
    ...vcs && {'lint:sensitive': 'ban'},
    ...contributors.map(contributor => contributor.scripts).reduce((acc, scripts) => ({...acc, ...scripts}), {}),

    ...('Application' === packageType) && {start: './lib/index.js'},
    ...('Package' === packageType) && definePackageBuildScripts()
  };
}

function defineVcsHostDetails(vcs, packageType, packageName) {
  return vcs && 'GitHub' === vcs.host && {
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
    sideEffects: false,
    publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'},
    files: ['lib/']
  };
}

export default function ({
  projectName,
  visibility,
  scope,
  projectType,
  license,
  tests,
  vcs,
  author,
  ci,
  description,
  configs,
  contributors
}) {
  const packageName = `${scope ? `@${scope}/` : ''}${projectName}`;

  return {
    name: packageName,
    description,
    license,
    ...('Package' === projectType) && definePackagingDetails(visibility),
    ...('Application' === projectType) && {private: true},
    ...defineVcsHostDetails(vcs, projectType, packageName),
    author: `${author.name}${author.email ? ` <${author.email}>` : ''}${author.url ? ` (${author.url})` : ''}`,
    scripts: defineScripts(projectType, configs, ci, tests, contributors, vcs)
  };
}
