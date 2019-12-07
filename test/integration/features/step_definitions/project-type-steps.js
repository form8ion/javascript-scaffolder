import {Given} from 'cucumber';
import bddStdIn from 'bdd-stdin';

Given('the project will be a(n) {string}', async function (projectType) {
  this.projectType = projectType;

  if ('application' === projectType) {
    this.applicationTypeAnswer = ['\n'];
    this.projectTypeAnswer = [bddStdIn.keys.up, '\n'];
  } else if ('package' === projectType) {
    this.packageTypeAnswer = ['\n'];
    this.projectTypeAnswer = ['\n'];
  } else if ('cli' === projectType) this.projectTypeAnswer = [bddStdIn.keys.down, '\n'];
  else throw new Error('invalid project type');
});
