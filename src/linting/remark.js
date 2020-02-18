import {promises as fsPromises} from 'fs';

export default async function ({config, projectRoot, vcs}) {
  await fsPromises.writeFile(
    `${projectRoot}/.remarkrc.js`,
    `exports.plugins = [
  '${config}'${
  !vcs
    ? `,
  ['validate-links', {repository: false}]`
    : ''
}
];`
  );

  return {
    devDependencies: [config, 'remark-cli'],
    scripts: {'lint:md': 'remark . --frail'}
  };
}
