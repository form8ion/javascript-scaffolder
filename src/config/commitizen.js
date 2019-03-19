import {writeFile} from 'mz/fs';

export default async function ({projectRoot}) {
  await writeFile(`${projectRoot}/.czrc`, JSON.stringify({path: './node_modules/cz-conventional-changelog'}));

  return {devDependencies: ['cz-conventional-changelog'], scripts: {}, vcsIgnore: {files: [], directories: []}};
}
