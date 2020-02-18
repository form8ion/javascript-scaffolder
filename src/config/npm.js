import {promises as fsPromises} from 'fs';

export default function ({projectRoot, projectType}) {
  const config = [
    'update-notifier=false',
    ...'Application' === projectType || 'CLI' === projectType ? ['save-exact=true'] : []
  ];

  fsPromises.writeFile(`${projectRoot}/.npmrc`, `${config.join('\n')}\n`);

  return {scripts: {'lint:peer': 'npm ls >/dev/null'}};
}
