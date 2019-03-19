import {writeFile} from 'mz/fs';

export default async function ({config, projectRoot}) {
  await writeFile(`${projectRoot}/.remarkrc.js`, `exports.plugins = ['${config}'];`);

  return {
    devDependencies: [config, 'remark-cli'],
    scripts: {'lint:md': 'remark . --frail'}
  };
}
