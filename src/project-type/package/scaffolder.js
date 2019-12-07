import {copyFile} from 'mz/fs';
import {info} from '@travi/cli-messages';
import determinePathToTemplateFile from '../../template-path';
import defineBadges from './badges';
import scaffoldPackageDocumentation from './documentation';
import choosePackageType from '../prompt';
import scaffoldChosenPackageType from '../../choice-scaffolder';

const defaultBuildDirectory = 'lib';

export default async function ({projectRoot, transpileLint, packageName, visibility, scope, packageTypes}) {
  info('Scaffolding Package Details');

  const commonPackageProperties = {
    version: '0.0.0-semantically-released',
    ...false !== transpileLint && {
      main: 'lib/index.cjs.js',
      module: 'lib/index.es.js',
      sideEffects: false,
      files: ['lib/']
    },
    ...false === transpileLint && {files: ['index.js']},
    publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'}
  };

  const commonResults = {
    packageProperties: commonPackageProperties,
    documentation: scaffoldPackageDocumentation({packageName, visibility, scope}),
    eslintConfigs: []
  };

  if (false !== transpileLint) {
    const coreBadges = defineBadges(packageName, visibility);
    const chosenType = await choosePackageType({types: packageTypes, projectType: 'package'});
    const results = await scaffoldChosenPackageType(packageTypes, chosenType, {projectRoot});

    await copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`);

    return {
      ...commonResults,
      dependencies: results.dependencies,
      devDependencies: [
        'rimraf',
        'rollup',
        'rollup-plugin-auto-external',
        ...results.devDependencies ? results.devDependencies : []
      ],
      scripts: {
        clean: `rimraf ./${defaultBuildDirectory}`,
        prebuild: 'run-s clean',
        build: 'npm-run-all --print-label --parallel build:*',
        'build:js': 'rollup --config',
        watch: 'run-s \'build:js -- --watch\'',
        prepack: 'run-s build',
        ...results.scripts
      },
      vcsIgnore: {
        files: [...results.vcsIgnore ? results.vcsIgnore.files : []],
        directories: [`/${defaultBuildDirectory}/`, ...results.vcsIgnore ? results.vcsIgnore.directories : []]
      },
      buildDirectory: defaultBuildDirectory,
      badges: {
        consumer: {
          ...coreBadges.consumer,
          ...'Public' === visibility && {
            runkit: {
              img: `https://badge.runkitcdn.com/${packageName}.svg`,
              text: `Try ${packageName} on RunKit`,
              link: `https://npm.runkit.com/${packageName}`
            }
          }
        },
        contribution: coreBadges.contribution,
        status: coreBadges.status
      }
    };
  }

  return {
    ...commonResults,
    scripts: {},
    badges: defineBadges(packageName, visibility)
  };
}
