import {writeFile} from 'mz/fs';

export default async function ({config, projectRoot, unitTested}) {
  if (config) {
    const eslintIgnoreDirectories = ['/lib/', ...unitTested ? ['/coverage/'] : []];

    await Promise.all([
      writeFile(`${projectRoot}/.eslintrc.yml`, `extends: '${config.prefix}/rules/es6'`),
      writeFile(`${projectRoot}/.eslintignore`, eslintIgnoreDirectories.join('\n'))
    ]);

    if (unitTested) {
      await Promise.all([
        writeFile(`${projectRoot}/test/.eslintrc.yml`, `extends: '${config.prefix}/rules/tests/base'`),
        writeFile(`${projectRoot}/test/unit/.eslintrc.yml`, `extends: '${config.prefix}/rules/tests/mocha'`)
      ]);
    }
  }

  return {
    devDependencies: [config ? config.packageName : undefined].filter(Boolean),
    vcsIgnore: {files: [config ? '.eslintcache' : undefined].filter(Boolean)}
  };
}
