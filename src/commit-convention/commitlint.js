import {writeFile} from 'mz/fs';

export default async function ({config, projectRoot}) {
  await writeFile(`${projectRoot}/.commitlintrc.js`, `module.exports = {extends: ['${config.name}']};`);

  return {devDependencies: [config.packageName]};
}
