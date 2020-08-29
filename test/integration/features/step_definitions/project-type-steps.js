import {Given} from 'cucumber';

Given('the project will be a(n) {string}', async function (projectType) {
  const {projectTypes} = require('@form8ion/javascript-core');
  this.projectType = projectType;

  if (projectTypes.APPLICATION === projectType) {
    this.applicationTypeAnswer = ['\n'];
    this.projectTypeAnswer = projectTypes.APPLICATION;
  } else if (projectTypes.PACKAGE === projectType) {
    this.packageTypeAnswer = ['\n'];
    this.projectTypeAnswer = projectTypes.PACKAGE;
  } else if (projectTypes.CLI === projectType) this.projectTypeAnswer = projectTypes.CLI;
  else throw new Error('invalid project type');
});
