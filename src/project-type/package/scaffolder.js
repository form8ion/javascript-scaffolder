import {promises as fsPromises} from 'fs';
import mustache from 'mustache';
import {info} from '@travi/cli-messages';
import touch from '../../../third-party-wrappers/touch';
import mkdir from '../../../third-party-wrappers/make-dir';
import determinePathToTemplateFile from '../../template-path';
import scaffoldChosenPackageType from '../../choice-scaffolder';
import choosePackageType from '../prompt';
import scaffoldPackageDocumentation from './documentation';
import defineBadges from './badges';

const defaultBuildDirectory = 'lib';

export default async function ({
  projectRoot,
  transpileLint,
  projectName,
  packageName,
  visibility,
  scope,
  packageTypes,
  tests,
  vcs,
  decisions
}) {
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
        ? [{summary: 'Add this repository to the Greenkeeper GitHub App list once v1.0.0 has been published'}]
        : []
    ]
  };

  if (false !== transpileLint) {
    const coreBadges = defineBadges(packageName, visibility);
    const chosenType = await choosePackageType({types: packageTypes, projectType: 'package', decisions});
    const results = await scaffoldChosenPackageType(packageTypes, chosenType, {projectRoot, tests});

    const pathToCreatedSrcDirectory = await mkdir(`${projectRoot}/src`);
    await Promise.all([
      fsPromises.copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`),
      fsPromises.writeFile(
        `${projectRoot}/example.js`,
        mustache.render(
          await fsPromises.readFile(determinePathToTemplateFile('example.mustache'), 'utf8'),
          {projectName}
        )
      ),
      touch(`${pathToCreatedSrcDirectory}/index.js`)
    ]);

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
