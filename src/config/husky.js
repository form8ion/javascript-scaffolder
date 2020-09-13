import {promises as fsPromises} from 'fs';

export default async function ({projectRoot}) {
  await fsPromises.writeFile(
    `${projectRoot}/.huskyrc.json`,
    JSON.stringify({hooks: {'pre-commit': 'npm test', 'commit-msg': 'commitlint --edit'}})
  );

  return {devDependencies: ['husky'], scripts: {}, vcsIgnore: {files: [], directories: []}};
}
