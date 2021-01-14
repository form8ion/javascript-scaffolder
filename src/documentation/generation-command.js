import {packageManagers} from '@form8ion/javascript-core';

export default function (packageManager) {
  if (packageManagers.NPM === packageManager) return 'npm run generate:md';
  if (packageManagers.YARN === packageManager) return 'yarn generate:md';

  throw new Error(
    `The ${packageManager} package manager is currently not supported. `
    + `Only ${Object.values(packageManagers).join(' and ')} are currently supported.`
  );
}
