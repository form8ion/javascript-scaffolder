import {Before, Given} from 'cucumber';
import any from '@travi/any';
import * as execa from '../../../../third-party-wrappers/execa';

Before(function () {
  this.sinonSandbox.stub(execa, 'default');
});

Given(/^the npm cli is logged in$/, function () {
  execa.default.withArgs('npm whoami').resolves(any.word());
});
