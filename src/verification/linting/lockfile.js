import {promises as fs} from 'fs';
import {packageManagers} from '@form8ion/javascript-core';

function determineLockfilePathFor(packageManager) {
  if (packageManagers.NPM === packageManager) return 'package-lock.json';
  if (packageManagers.YARN === packageManager) return 'yarn.lock';

  throw new Error(
    `The ${packageManager} package manager is currently not supported. `
    + `Only ${Object.values(packageManagers).join(' and ')} are currently supported.`
  );
}

export default async function ({projectRoot, packageManager, registries}) {
  await fs.writeFile(
    `${projectRoot}/.lockfile-lintrc.json`,
    JSON.stringify({
      path: determineLockfilePathFor(packageManager),
      type: packageManager,
      'validate-https': true,
      'allowed-hosts': [packageManager, ...registries ? Object.values(registries) : []]
    })
  );

  return {
    devDependencies: ['lockfile-lint'],
    scripts: {'lint:lockfile': 'lockfile-lint'}
  };
}
