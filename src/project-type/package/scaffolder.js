import {copyFile} from 'mz/fs';
import {info} from '@travi/cli-messages';
import determinePathToTemplateFile from '../../template-path';
import defineBadges from './badges';
import scaffoldPackageDocumentation from './documentation';
import choosePackageType from '../prompt';
import scaffoldChosenPackageType from '../../choice-scaffolder';

const defaultBuildDirectory = 'lib';

export default async function ({projectRoot, transpileLint, packageName, visibility, scope, packageTypes, tests, vcs}) {
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
    eslintConfigs: [],
    nextSteps: [
      {summary: 'Add the appropriate `save` flag to the installation instructions in the README'},
      {summary: 'Publish pre-release versions to npm until package is stable enough to publish v1.0.0'},
      ...('Public' === visibility && vcs && 'GitHub' === vcs.host)
        ? [
          {summary: 'Register the greenkeeper-keeper webhook'},
          {summary: 'Add this repository to the Greenkeeper GitHub App list once v1.0.0 has been published'}
        ]
        : []
    ]
  };

  if (false !== transpileLint) {
    const coreBadges = defineBadges(packageName, visibility);
    const chosenType = await choosePackageType({types: packageTypes, projectType: 'package'});
    const results = await scaffoldChosenPackageType(packageTypes, chosenType, {projectRoot, tests});

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
      eslintConfigs: [...results.eslintConfigs ? results.eslintConfigs : []],
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
            },
            ...vcs && 'GitHub' === vcs.host && {
              greenkeeper: {
                img: `https://badges.greenkeeper.io/${vcs.owner}/${vcs.name}.svg`,
                text: 'Greenkeeper',
                link: 'https://greenkeeper.io/'
              }
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
