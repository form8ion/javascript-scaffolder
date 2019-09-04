import {writeFile} from 'mz/fs';

export default async function ({config, projectRoot, vcs}) {
  await writeFile(
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
