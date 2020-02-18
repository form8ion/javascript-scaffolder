import {promises as fsPromises} from 'fs';

export default async function ({config, projectRoot}) {
  await fsPromises.writeFile(`${projectRoot}/.commitlintrc.js`, `module.exports = {extends: ['${config.name}']};`);

  return {devDependencies: [config.packageName]};
}
