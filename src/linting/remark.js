import {promises as fsPromises} from 'fs';
import deepmerge from 'deepmerge';

export default async function ({config, projectRoot, projectType, vcs, transpileLint}) {
  await fsPromises.writeFile(
    `${projectRoot}/.remarkrc.js`,
    `// https://github.com/remarkjs/remark/tree/master/packages/remark-stringify#options
exports.settings = {
  listItemIndent: 1,
  emphasis: '_',
  strong: '_',
  bullet: '*',
  incrementListMarker: false
};

exports.plugins = [
  '${config}',
  [require('remark-toc'), {tight: true}]${
  'Package' === projectType
    ? `,
  ['remark-usage', {heading: 'example'}]`
    : ''
}${
  !vcs
    ? `,
  ['validate-links', {repository: false}]`
    : ''
}
];`
  );

  return deepmerge(
    {
      devDependencies: [config, 'remark-cli', 'remark-toc'],
      scripts: {
        'lint:md': 'remark . --frail',
        'generate:md': 'remark . --output'
      }
    },
    {
      ...'Package' === projectType && {
        devDependencies: ['remark-usage'],
        ...transpileLint && {scripts: {'pregenerate:md': 'npm run build'}}
      }
    }
  );
}
