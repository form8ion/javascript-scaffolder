import deepmerge from 'deepmerge';
import {dialects, scaffoldChoice as scaffoldChosenPackageType} from '@form8ion/javascript-core';
import {info} from '@travi/cli-messages';
import choosePackageType from '../prompt';
import scaffoldPackageDocumentation from './documentation';
import defineBadges from './badges';
import buildDetails from './build-details';

export default async function ({
  projectRoot,
  projectName,
  packageName,
  packageManager,
  visibility,
  scope,
  packageTypes,
  tests,
  decisions,
  dialect
}) {
  info('Scaffolding Package Details');

  const detailsForBuild = await buildDetails({projectRoot, projectName, visibility, packageName, dialect});
  const details = {
    ...dialects.BABEL === dialect && {
      packageProperties: {
        main: 'lib/index.cjs.js',
        module: 'lib/index.es.js',
        sideEffects: false,
        files: ['lib/']
      },
      ...detailsForBuild
    },
    ...dialects.TYPESCRIPT === dialect && {
      packageProperties: {
        main: 'lib/index.cjs.js',
        module: 'lib/index.es.js',
        sideEffects: false,
        files: ['lib/']
      },
      ...detailsForBuild
    },
    ...dialects.COMMON_JS === dialect && {
      packageProperties: {files: ['index.js']},
      ...detailsForBuild
    }
  };

  const chosenType = await choosePackageType({types: packageTypes, projectType: 'package', decisions});
  const results = await scaffoldChosenPackageType(
    packageTypes,
    chosenType,
    {projectRoot, projectName, packageName, tests, scope}
  );

  return deepmerge.all([
    {
      packageProperties: {
        version: '0.0.0-semantically-released',
        files: ['example.js'],
        publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'},
        ...'Public' === visibility && {runkitExampleFilename: './example.js'}
      },
      documentation: scaffoldPackageDocumentation({packageName, visibility, scope, packageManager}),
      eslintConfigs: [],
      nextSteps: [
        {summary: 'Add the appropriate `save` flag to the installation instructions in the README'},
        {summary: 'Publish pre-release versions to npm until package is stable enough to publish v1.0.0'}
      ],
      scripts: {},
      badges: defineBadges(packageName, visibility)
    },
    results,
    details
  ]);
}
