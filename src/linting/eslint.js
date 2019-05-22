import {writeFile} from 'mz/fs';
import mkdir from '../../third-party-wrappers/make-dir';

export default async function ({config, projectRoot, unitTested, buildDirectory}) {
  const eslintIgnoreDirectories = [`/${buildDirectory}/`, ...unitTested ? ['/coverage/'] : []];

  await Promise.all([
    writeFile(`${projectRoot}/.eslintrc.yml`, `extends: '${config.prefix}/rules/es6'`),
    writeFile(`${projectRoot}/.eslintignore`, eslintIgnoreDirectories.join('\n'))
  ]);

  if (unitTested) {
    const pathToCreatedUnitTestDirectory = await mkdir(`${projectRoot}/test/unit`);
    await Promise.all([
      writeFile(`${pathToCreatedUnitTestDirectory}/../.eslintrc.yml`, `extends: '${config.prefix}/rules/tests/base'`),
      writeFile(`${pathToCreatedUnitTestDirectory}/.eslintrc.yml`, `extends: '${config.prefix}/rules/tests/mocha'`)
    ]);
  }

  return {
    devDependencies: [config.packageName],
    scripts: {'lint:js': 'eslint . --cache'},
    vcsIgnore: {files: ['.eslintcache']}
  };
}
