import {writeFile} from 'mz/fs';

export default function ({projectRoot, projectType}) {
  const config = [
    'update-notifier=false',
    ...'Application' === projectType ? ['save-exact=true'] : []
  ];

  writeFile(`${projectRoot}/.npmrc`, `${config.join('\n')}\n`);
}
