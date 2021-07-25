import {promises as fsPromises} from 'fs';
import deepmerge from 'deepmerge';
import {dialects, projectTypes} from '@form8ion/javascript-core';

export default async function ({config, projectRoot, projectType, vcs, dialect}) {
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
  ['remark-toc', {tight: true}]${
  projectTypes.PACKAGE === projectType
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
      ...projectTypes.PACKAGE === projectType && {
        devDependencies: ['remark-usage'],
        ...dialects.COMMON_JS !== dialect && {scripts: {'pregenerate:md': 'run-s build'}}
      }
    }
  );
}
