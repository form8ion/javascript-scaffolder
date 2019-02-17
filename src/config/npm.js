import {writeFile} from 'mz/fs';

export default function ({projectRoot, packageType}) {
  const config = [
    'update-notifier=false',
    ...'Application' === packageType ? ['save-exact=true'] : []
  ];

  writeFile(`${projectRoot}/.npmrc`, `${config.join('\n')}\n`);
}
