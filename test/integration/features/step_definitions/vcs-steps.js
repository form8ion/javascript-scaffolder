import {Given} from 'cucumber';
import any from '@travi/any';

Given(/^the project will not be versioned$/, async function () {
  this.vcs = undefined;
});

Given(/^the project will be versioned$/, async function () {
  this.ciAnswer = ['\n'];
  this.vcs = {host: any.word(), owner: any.word(), name: any.word()};
});
