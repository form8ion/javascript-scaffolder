import {promises as fs} from 'fs';
import {Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import {assertDevDependencyIsInstalled} from './common-steps';

Then('the package is bundled with rollup', async function () {
  const {dialects} = require('@form8ion/javascript-core');
  const autoExternal = 'rollup-plugin-auto-external';
  const {scripts} = JSON.parse(await fs.readFile(`${process.cwd()}/package.json`, 'utf-8'));

  const {dialect, scaffoldResult: {vcsIgnore}} = this;

  assertDevDependencyIsInstalled(this.execa, 'rollup');
  assertDevDependencyIsInstalled(this.execa, autoExternal);

  assert.equal(
    await fs.readFile(`${process.cwd()}/rollup.config.js`, 'utf-8'),
    `/* eslint import/no-extraneous-dependencies: ['error', {'devDependencies': true}] */
import autoExternal from '${autoExternal}';

export default {
  input: 'src/index.js',
  plugins: [autoExternal()],
  output: [
    {file: 'lib/index.cjs.js', format: 'cjs', sourcemap: true},
    {file: 'lib/index.es.js', format: 'es', sourcemap: true}
  ]
};
`
  );
  assert.equal(scripts['build:js'], 'rollup --config');
  assert.equal(scripts.watch, 'run-s \'build:js -- --watch\'');

  if (dialects.TYPESCRIPT === dialect) {
    assert.include(vcsIgnore.directories, '.rollup.cache/');
    assertDevDependencyIsInstalled(this.execa, '@rollup/plugin-typescript');
  }
});
