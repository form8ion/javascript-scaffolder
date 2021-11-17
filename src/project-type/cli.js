import deepmerge from 'deepmerge';
import {projectTypes} from '@form8ion/javascript-core';

import {scaffold as scaffoldRollup} from '../build/rollup';
import defineBadges from './package/badges';

const defaultBuildDirectory = 'bin';

export default async function ({packageName, visibility, projectRoot, dialect}) {
  const rollupResults = await scaffoldRollup({projectRoot, dialect, projectType: projectTypes.CLI});

  return deepmerge(
    rollupResults,
    {
      scripts: {
        clean: `rimraf ./${defaultBuildDirectory}`,
        prebuild: 'run-s clean',
        build: 'npm-run-all --print-label --parallel build:*',
        prepack: 'run-s build'
      },
      dependencies: ['update-notifier'],
      devDependencies: ['rimraf'],
      vcsIgnore: {files: [], directories: [`/${defaultBuildDirectory}/`]},
      buildDirectory: defaultBuildDirectory,
      badges: defineBadges(packageName, visibility),
      packageProperties: {
        version: '0.0.0-semantically-released',
        bin: {},
        files: [`${defaultBuildDirectory}/`],
        publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'}
      },
      eslintConfigs: [],
      nextSteps: []
    }
  );
}
