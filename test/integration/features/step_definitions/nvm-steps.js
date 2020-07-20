import {Before, Given} from 'cucumber';
import any from '@travi/any';
import td from 'testdouble';

function versionSegment() {
  return any.integer({max: 20});
}

const majorVersion = versionSegment();

function semverStringFactory() {
  return `v${majorVersion}.${versionSegment()}.${versionSegment()}`;
}

Before(function () {
  this.shell.exec = td.func();
});

Given(/^nvm is properly configured$/, function () {
  this.latestLtsMajorVersion = majorVersion;
  this.latestLtsVersion = semverStringFactory();

  td.when(this.shell.exec('. ~/.nvm/nvm.sh && nvm ls-remote --lts', {silent: true}))
    .thenCallback(0, [...any.listOf(semverStringFactory), this.latestLtsVersion, ''].join('\n'));
  td.when(this.shell.exec('. ~/.nvm/nvm.sh && nvm install', {silent: false})).thenCallback(0);
});
