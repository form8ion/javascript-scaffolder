import {Given} from 'cucumber';
import bddStdIn from 'bdd-stdin';

Given('the project will be a(n) {string}', async function (projectType) {
  this.projectType = projectType;

  if ('application' === projectType) this.projectTypeAnswer = [bddStdIn.keys.down, '\n'];
  else this.projectTypeAnswer = ['\n'];
});
