import {Before, Given} from 'cucumber';
import any from '@travi/any';
import * as exec from '../../../../third-party-wrappers/exec-as-promised';

Before(function () {
  this.sinonSandbox.stub(exec, 'default');
});

Given(/^the npm cli is logged in$/, function () {
  exec.default.withArgs('npm whoami').resolves(`${any.word()}\n`);
});
