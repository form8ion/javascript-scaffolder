import {promises as fsPromises} from 'fs';

export default async function ({projectRoot}) {
  await fsPromises.writeFile(
    `${projectRoot}/.czrc`,
    JSON.stringify({path: './node_modules/cz-conventional-changelog'})
  );

  return {devDependencies: ['cz-conventional-changelog'], scripts: {}, vcsIgnore: {files: [], directories: []}};
}
