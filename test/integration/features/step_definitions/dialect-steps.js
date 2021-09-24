import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {load} from 'js-yaml';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import any from '@travi/any';
import {assertDevDependencyIsInstalled} from './common-steps';

async function assertBabelIsNotConfigured() {
  assert.isFalse(await fileExists(`${process.cwd()}/.babelrc`));
}

async function assertBabelDialectDetailsAreCorrect(babelPreset, buildDirectory, execa) {
  const {presets, ignore} = JSON.parse(await fs.readFile(`${process.cwd()}/.babelrc`, 'utf-8'));

  assert.deepEqual(presets, [babelPreset.name]);
  assert.deepEqual(ignore, [`./${buildDirectory}/`]);
  assertDevDependencyIsInstalled(execa, babelPreset.packageName);
}

async function assertTypescriptDialectDetailsAreCorrect(
  eslintConfig,
  eslintScope,
  typescriptConfig,
  {vcsIgnore},
  unitTestAnswer,
  testFilenamePattern,
  projectType,
  execa
) {
  const {projectTypes} = require('@form8ion/javascript-core');
  const [tsConfigContents, packageContents] = await Promise.all([
    fs.readFile(`${process.cwd()}/tsconfig.json`, 'utf-8'),
    fs.readFile(`${process.cwd()}/package.json`, 'utf-8')
  ]);

  assert.include(eslintConfig.extends, `${eslintScope}/typescript`);
  assert.deepEqual(
    JSON.parse(tsConfigContents),
    {
      $schema: 'https://json.schemastore.org/tsconfig',
      extends: `${typescriptConfig.scope}/tsconfig`,
      compilerOptions: {
        rootDir: 'src',
        ...projectTypes.PACKAGE === projectType && {
          outDir: 'lib',
          declaration: true
        }
      },
      include: ['src/**/*.ts'],
      ...unitTestAnswer && {exclude: [testFilenamePattern]}
    }
  );
  assert.equal(JSON.parse(packageContents).types, 'lib/index.d.ts');
  assertDevDependencyIsInstalled(execa, 'typescript');
  assertDevDependencyIsInstalled(execa, `${typescriptConfig.scope}/tsconfig`);
  assertDevDependencyIsInstalled(execa, `${eslintScope}/eslint-config-typescript`);
  assert.include(vcsIgnore.files, 'tsconfig.tsbuildinfo');

  await assertBabelIsNotConfigured();
}

async function assertCommonJsDialectDetailsAreCorrect() {
  await assertBabelIsNotConfigured();
}

Given('the project will use the {string} dialect', async function (dialect) {
  const {dialects} = require('@form8ion/javascript-core');
  this.dialect = dialect;

  if (dialects.TYPESCRIPT === dialect) {
    this.typescriptConfig = {scope: `@${any.word()}`};
  }
});

Given('a babel preset is provided', async function () {
  this.babelPreset = {name: any.word(), packageName: any.word()};
});

Given('no babel preset is provided', async function () {
  this.babelPreset = undefined;
});

Then('the {string} dialect is configured', async function (dialect) {
  const {dialects} = require('@form8ion/javascript-core');
  const eslintConfig = load(await fs.readFile(`${process.cwd()}/.eslintrc.yml`, 'utf-8'));

  const {
    buildDirectory,
    babelPreset,
    typescriptConfig,
    eslintScope,
    scaffoldResult,
    unitTestAnswer,
    testFilenamePattern,
    projectType
  } = this;

  if (dialects.BABEL === dialect) await assertBabelDialectDetailsAreCorrect(babelPreset, buildDirectory, this.execa);

  if (dialects.TYPESCRIPT === dialect) {
    await assertTypescriptDialectDetailsAreCorrect(
      eslintConfig,
      eslintScope,
      typescriptConfig,
      scaffoldResult,
      unitTestAnswer,
      testFilenamePattern,
      projectType,
      this.execa
    );
  }

  if (dialects.COMMON_JS === dialect) {
    await assertCommonJsDialectDetailsAreCorrect();
  }
});

Then('an error is reported about the missing babel preset', async function () {
  assert.equal(this.resultError.message, 'No babel preset provided. Cannot configure babel transpilation');
});
