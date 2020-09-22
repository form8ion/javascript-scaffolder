import {promises as fs} from 'fs';

export default async function ({projectRoot}) {
  await fs.writeFile(
    `${projectRoot}/.lockfile-lintrc.json`,
    JSON.stringify({path: 'package-lock.json', type: 'npm', 'validate-https': true, 'allowed-hosts': ['npm']})
  );

  return {
    devDependencies: ['lockfile-lint'],
    scripts: {'lint:lockfile': 'lockfile-lint'}
  };
}
