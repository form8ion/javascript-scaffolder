import {promises as fs} from 'fs';
import {projectTypes} from '@form8ion/javascript-core';

export default function ({projectRoot, projectType}) {
  const config = [
    'update-notifier=false',
    'engine-strict=true',
    ...projectTypes.APPLICATION === projectType || projectTypes.CLI === projectType ? ['save-exact=true'] : []
  ];

  fs.writeFile(`${projectRoot}/.npmrc`, `${config.join('\n')}\n`);

  return {scripts: {'lint:peer': 'npm ls >/dev/null'}};
}
