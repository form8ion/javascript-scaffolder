import {promises as fs} from 'fs';
import deepmerge from 'deepmerge';
import mustache from 'mustache';
import {dialects, projectTypes} from '@form8ion/javascript-core';
import {scaffold as scaffoldRollup} from '@form8ion/rollup';

import camelcase from '../../../third-party-wrappers/camelcase';
import mkdir from '../../../third-party-wrappers/make-dir';
import touch from '../../../third-party-wrappers/touch';
import determinePathToTemplateFile from '../../template-path';

const defaultBuildDirectory = 'lib';

async function createExample(projectRoot, projectName) {
  return fs.writeFile(
    `${projectRoot}/example.js`,
    mustache.render(
      await fs.readFile(determinePathToTemplateFile('example.mustache'), 'utf8'),
      {projectName: camelcase(projectName)}
    )
  );
}

async function buildDetailsForCommonJsProject({projectRoot, projectName}) {
  await Promise.all([
    touch(`${projectRoot}/index.js`),
    fs.writeFile(`${projectRoot}/example.js`, `const ${camelcase(projectName)} = require('.');\n`)
  ]);

  return {};
}

export default async function ({projectRoot, projectName, visibility, packageName, dialect}) {
  if (dialects.COMMON_JS === dialect) return buildDetailsForCommonJsProject({projectRoot, projectName});

  const pathToCreatedSrcDirectory = await mkdir(`${projectRoot}/src`);
  const [rollupResults] = await Promise.all([
    scaffoldRollup({projectRoot, dialect, projectType: projectTypes.PACKAGE}),
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
