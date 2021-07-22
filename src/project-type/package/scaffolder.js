import {promises as fs} from 'fs';
import deepmerge from 'deepmerge';
import mustache from 'mustache';
import {fileExists} from '@form8ion/core';
import {scaffoldChoice as scaffoldChosenPackageType, dialects} from '@form8ion/javascript-core';
import {info} from '@travi/cli-messages';
import camelcase from '../../../third-party-wrappers/camelcase';
import touch from '../../../third-party-wrappers/touch';
import mkdir from '../../../third-party-wrappers/make-dir';
import determinePathToTemplateFile from '../../template-path';
import {scaffold as scaffoldRollup} from '../../build/rollup';
import choosePackageType from '../prompt';
import scaffoldPackageDocumentation from './documentation';
import defineBadges from './badges';

const defaultBuildDirectory = 'lib';

async function createExample(projectRoot, projectName) {
  const pathToExample = `${projectRoot}/example.js`;

  if (!await fileExists(pathToExample)) {
    return fs.writeFile(
      pathToExample,
      mustache.render(
        await fs.readFile(determinePathToTemplateFile('example.mustache'), 'utf8'),
        {projectName: camelcase(projectName)}
      )
    );
  }

  return undefined;
}

async function buildDetails(packageTypes, decisions, projectRoot, tests, projectName, visibility, packageName) {
  const pathToCreatedSrcDirectory = await mkdir(`${projectRoot}/src`);
  const [rollupResults] = await Promise.all([
    scaffoldRollup({projectRoot}),
    await createExample(projectRoot, projectName),
    touch(`${pathToCreatedSrcDirectory}/index.js`)
  ]);

  return deepmerge(
    rollupResults,
    {
      devDependencies: ['rimraf'],
      scripts: {
        clean: `rimraf ./${defaultBuildDirectory}`,
        prebuild: 'run-s clean',
        build: 'npm-run-all --print-label --parallel build:*',
        prepack: 'run-s build'
      },
      vcsIgnore: {directories: [`/${defaultBuildDirectory}/`]},
      buildDirectory: defaultBuildDirectory,
      badges: {
        consumer: {
          ...'Public' === visibility && {
            runkit: {
              img: `https://badge.runkitcdn.com/${packageName}.svg`,
              text: `Try ${packageName} on RunKit`,
              link: `https://npm.runkit.com/${packageName}`
            }
          }
        }
      }
    }
  );
}

async function buildDetailsForNonTranspiledProject(projectRoot, projectName) {
  await Promise.all([
    touch(`${projectRoot}/index.js`),
    fs.writeFile(`${projectRoot}/example.js`, `const ${camelcase(projectName)} = require('.');\n`)
  ]);

  return {};
}

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

  const details = {
    ...dialects.BABEL === dialect && {
      packageProperties: {
        main: 'lib/index.cjs.js',
        module: 'lib/index.es.js',
        sideEffects: false,
        files: ['lib/']
      },
      ...await buildDetails(
        packageTypes,
        decisions,
        projectRoot,
        tests,
        projectName,
        visibility,
        packageName
      )
    },
    ...dialects.COMMON_JS === dialect && {
      packageProperties: {files: ['index.js']},
      ...await buildDetailsForNonTranspiledProject(projectRoot, projectName)
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
