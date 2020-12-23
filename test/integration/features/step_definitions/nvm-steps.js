import {Given} from 'cucumber';
import any from '@travi/any';
import td from 'testdouble';

function versionSegment() {
  return any.integer({max: 20});
}

const majorVersion = versionSegment();

function semverStringFactory() {
  return `v${majorVersion}.${versionSegment()}.${versionSegment()}`;
}

Given(/^nvm is properly configured$/, function () {
  this.latestLtsMajorVersion = majorVersion;
  this.latestLtsVersion = semverStringFactory();

  td.when(this.execa('. ~/.nvm/nvm.sh && nvm ls-remote --lts', {shell: true}))
    .thenResolve({stdout: [...any.listOf(semverStringFactory), this.latestLtsVersion, ''].join('\n')});
  td.when(this.execa('. ~/.nvm/nvm.sh && nvm install', {shell: true})).thenReturn({stdout: {pipe: () => undefined}});
});
