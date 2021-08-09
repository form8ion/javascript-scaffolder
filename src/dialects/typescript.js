import {promises as fs} from 'fs';

export default async function ({config, projectRoot}) {
  const eslintConfigs = ['typescript'];

  await fs.writeFile(`${projectRoot}/tsconfig.json`, JSON.stringify({extends: `${config.scope}/tsconfig`}));

  return {
    eslint: {configs: eslintConfigs},
    eslintConfigs
  };
}
