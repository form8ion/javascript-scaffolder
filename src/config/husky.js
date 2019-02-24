import {writeFile} from 'mz/fs';

export default async function ({projectRoot}) {
  await writeFile(
    `${projectRoot}/.huskyrc.json`,
    JSON.stringify({hooks: {'pre-commit': 'npm test', 'commit-msg': 'commitlint -e'}})
  );

  return {devDependencies: ['husky']};
}
