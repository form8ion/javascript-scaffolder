import {Given} from 'cucumber';
import any from '@travi/any';
import * as exec from '../../../../third-party-wrappers/exec-as-promised';

function versionSegment() {
  return any.integer({max: 20});
}

function semverStringFactory() {
  return `v${versionSegment()}.${versionSegment()}.${versionSegment()}`;
}

Given(/^nvm is properly configured$/, function () {
  this.latestLtsVersion = semverStringFactory();

  exec.default
    .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote --lts')
    .resolves([...any.listOf(semverStringFactory), this.latestLtsVersion, ''].join('\n'));
  exec.default.withArgs('. ~/.nvm/nvm.sh && nvm install').resolves();
});
