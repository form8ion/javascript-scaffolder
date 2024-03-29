import deepmerge from 'deepmerge';
import {projectTypes, scaffoldChoice as scaffoldChosenApplicationType} from '@form8ion/javascript-core';
import {info} from '@travi/cli-messages';
import chooseApplicationType from './prompt';

export default async function ({monorepoTypes, projectRoot, packageManager, decisions}) {
  info('Scaffolding Monorepo Details');

  const chosenType = await chooseApplicationType({types: monorepoTypes, projectType: projectTypes.MONOREPO, decisions});
  const results = await scaffoldChosenApplicationType(monorepoTypes, chosenType, {projectRoot, packageManager});

  return deepmerge(
    {
      eslintConfigs: [],
      packageProperties: {private: true},
      nextSteps: [{
        summary: 'Add packages to your new monorepo',
        description: 'Leverage [@form8ion/add-package-to-monorepo](https://npm.im/@form8ion/add-package-to-monorepo)'
          + ' to scaffold new packages into your new monorepo'
      }]
    },
    results
  );
}
