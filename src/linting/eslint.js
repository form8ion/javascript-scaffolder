import {writeFile} from 'mz/fs';

export default async function ({config, projectRoot, unitTested, buildDirectory, additionalConfigs}) {
  const {packageName, prefix} = config;
  const eslintIgnoreDirectories = [`/${buildDirectory}/`, ...unitTested ? ['/coverage/'] : []];

  await Promise.all([
    writeFile(
      `${projectRoot}/.eslintrc.yml`,
      additionalConfigs
        ? `extends:\n  - '${prefix}'\n  - '${prefix}/${additionalConfigs.join(`'\n  - '${prefix}/`)}'`
        : `extends: '${prefix}'`
    ),
    writeFile(`${projectRoot}/.eslintignore`, eslintIgnoreDirectories.join('\n'))
  ]);

  return {
    devDependencies: [packageName, ...unitTested ? [`${prefix}/mocha`] : []],
    scripts: {'lint:js': 'eslint . --cache'},
    vcsIgnore: {files: ['.eslintcache']}
  };
}
