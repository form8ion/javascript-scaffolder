import deepmerge from 'deepmerge';
import {scaffold as scaffoldRollup} from '../build/rollup';
import defineBadges from './package/badges';

const defaultBuildDirectory = 'bin';

export default async function ({packageName, visibility, projectRoot}) {
  const rollupResults = await scaffoldRollup({projectRoot});

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
      devDependencies: [
        'rimraf',
        '@rollup/plugin-json',
        'rollup-plugin-executable'
      ],
      vcsIgnore: {files: [], directories: [`/${defaultBuildDirectory}/`]},
      buildDirectory: defaultBuildDirectory,
      badges: defineBadges(packageName, visibility),
      packageProperties: {
        version: '0.0.0-semantically-released',
        bin: {},
        files: ['bin/'],
        publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'}
      },
      eslintConfigs: [],
      nextSteps: []
    }
  );
}
