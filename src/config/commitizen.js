import {promises as fsPromises} from 'fs';

export default async function ({projectRoot}) {
  await fsPromises.writeFile(
    `${projectRoot}/.czrc`,
    JSON.stringify({path: './node_modules/cz-conventional-changelog'})
  );

  return {
    devDependencies: ['cz-conventional-changelog'],
    badges: {
      contribution: {
        commitizen: {
          img: 'https://img.shields.io/badge/commitizen-friendly-brightgreen.svg',
          text: 'Commitizen friendly',
          link: 'http://commitizen.github.io/cz-cli/'
        }
      }
    }
  };
}
