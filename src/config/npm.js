import {promises as fs} from 'fs';
import {stringify} from 'ini';
import {projectTypes} from '@form8ion/javascript-core';

export default async function ({projectRoot, projectType, registries}) {
  await fs.writeFile(
    `${projectRoot}/.npmrc`,
    stringify({
      'update-notifier': false,
      'engine-strict': true,
      ...(projectTypes.APPLICATION === projectType || projectTypes.CLI === projectType) && {'save-exact': true},
      ...registries
        && Object.fromEntries(Object.entries(registries).map(([scope, url]) => ([`@${scope}:registry`, url])))
    })
  );

  return {scripts: {'lint:peer': 'npm ls >/dev/null'}};
}
