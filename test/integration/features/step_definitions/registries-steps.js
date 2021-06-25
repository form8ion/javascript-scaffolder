import {promises as fs} from 'fs';
import {parse} from 'ini';
import {Given, Then} from '@cucumber/cucumber';
import any from '@travi/any';
import {assert} from 'chai';

Given('registries are defined for scopes', async function () {
  this.registries = any.simpleObject();
});

Then('the registry configuration is defined', async function () {
  const npmConfig = parse(await fs.readFile(`${process.cwd()}/.npmrc`, 'utf-8'));

  Object.entries(this.registries).forEach(([scope, url]) => {
    assert.equal(npmConfig[scope], url);
  });
});
