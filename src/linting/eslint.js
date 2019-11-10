import {writeFile} from 'mz/fs';

export default async function ({config, projectRoot, unitTested, buildDirectory, additionalConfigs}) {
  const {scope} = config;
  const eslintIgnoreDirectories = [`/${buildDirectory}/`, ...unitTested ? ['/coverage/'] : []];

  await Promise.all([
    writeFile(
      `${projectRoot}/.eslintrc.yml`,
      additionalConfigs && additionalConfigs.length
        ? `extends:\n  - '${scope}'\n  - '${scope}/${additionalConfigs.join(`'\n  - '${scope}/`)}'`
        : `extends: '${scope}'`
    ),
    writeFile(`${projectRoot}/.eslintignore`, eslintIgnoreDirectories.join('\n'))
  ]);

  return {
    devDependencies: [
      `${scope}/eslint-config`,
      ...additionalConfigs
        ? additionalConfigs.map(supportingConfig => `${scope}/eslint-config-${supportingConfig}`)
        : []
    ],
    scripts: {'lint:js': 'eslint . --cache'},
    vcsIgnore: {files: ['.eslintcache']}
  };
}
