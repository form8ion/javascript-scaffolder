import {Given} from 'cucumber';
import any from '@travi/any';

Given('the package will be added to an existing monorepo', async function () {
  this.pathWithinParent = any.string();
  this.ciAnswer = null;
});
