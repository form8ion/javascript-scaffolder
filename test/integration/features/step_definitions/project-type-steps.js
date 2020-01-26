import {Given} from 'cucumber';

Given('the project will be a(n) {string}', async function (projectType) {
  this.projectType = projectType;

  if ('Application' === projectType) {
    this.applicationTypeAnswer = ['\n'];
    this.projectTypeAnswer = 'Application';
  } else if ('Package' === projectType) {
    this.packageTypeAnswer = ['\n'];
    this.projectTypeAnswer = 'Package';
  } else if ('CLI' === projectType) this.projectTypeAnswer = 'CLI';
  else throw new Error('invalid project type');
});
