import {copyFile} from 'mz/fs';
import {info} from '@travi/cli-messages';
import determinePathToTemplateFile from '../../template-path';
import defineBadges from './badges';
import scaffoldPackageDocumentation from './documentation';

const defaultBuildDirectory = 'lib';

export default async function ({projectRoot, transpileLint, packageName, visibility, scope}) {
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

  if (false !== transpileLint) {
    const coreBadges = defineBadges(packageName, visibility);

    await copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`);

    return {
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
      },
      packageProperties: commonPackageProperties,
      documentation: scaffoldPackageDocumentation({packageName, visibility, scope}),
      eslintConfigs: []
    };
  }

  return {
    scripts: {},
    badges: defineBadges(packageName, visibility),
    packageProperties: commonPackageProperties,
    eslintConfigs: []
  };
}
