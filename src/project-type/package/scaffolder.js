import {promises as fs} from 'fs';
import deepmerge from 'deepmerge';
import mustache from 'mustache';
import {scaffoldChoice as scaffoldChosenPackageType} from '@form8ion/javascript-core';
import {info} from '@travi/cli-messages';
import camelcase from '../../../third-party-wrappers/camelcase';
import touch from '../../../third-party-wrappers/touch';
import mkdir from '../../../third-party-wrappers/make-dir';
import determinePathToTemplateFile from '../../template-path';
import choosePackageType from '../prompt';
import scaffoldPackageDocumentation from './documentation';
import defineBadges from './badges';

const defaultBuildDirectory = 'lib';

async function buildDetails(packageTypes, decisions, projectRoot, tests, projectName, visibility, packageName) {
  const chosenType = await choosePackageType({types: packageTypes, projectType: 'package', decisions});
  const results = await scaffoldChosenPackageType(packageTypes, chosenType, {projectRoot, projectName, tests});

  const pathToCreatedSrcDirectory = await mkdir(`${projectRoot}/src`);
  await Promise.all([
    fs.copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`),
    fs.writeFile(
      `${projectRoot}/example.js`,
      mustache.render(
        await fs.readFile(determinePathToTemplateFile('example.mustache'), 'utf8'),
        {projectName: camelcase(projectName)}
      )
    ),
    touch(`${pathToCreatedSrcDirectory}/index.js`)
  ]);

  return deepmerge(
    results,
    {
      devDependencies: ['rimraf', 'rollup', 'rollup-plugin-auto-external'],
      scripts: {
        clean: `rimraf ./${defaultBuildDirectory}`,
        prebuild: 'run-s clean',
        build: 'npm-run-all --print-label --parallel build:*',
        'build:js': 'rollup --config',
        watch: 'run-s \'build:js -- --watch\'',
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
  transpileLint,
  projectName,
  packageName,
  visibility,
  scope,
  packageTypes,
  tests,
  decisions
}) {
  info('Scaffolding Package Details');

  return deepmerge.all([
    {
      packageProperties: {
        version: '0.0.0-semantically-released',
        files: ['example.js'],
        publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'},
        ...'Public' === visibility && {runkitExampleFilename: './example.js'}
      },
      documentation: scaffoldPackageDocumentation({packageName, visibility, scope}),
      eslintConfigs: [],
      nextSteps: [
        {summary: 'Add the appropriate `save` flag to the installation instructions in the README'},
        {summary: 'Publish pre-release versions to npm until package is stable enough to publish v1.0.0'}
      ],
      scripts: {},
      badges: defineBadges(packageName, visibility)
    },
    {
      ...false !== transpileLint && {
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
      ...false === transpileLint && {
        packageProperties: {files: ['index.js']},
        ...await buildDetailsForNonTranspiledProject(projectRoot, projectName)
      }
    }
  ]);
}
