import chalk from 'chalk';
import exec from '../../third-party-wrappers/exec-as-promised';

export async function determineLatestVersionOf(nodeVersionCategory) {
  console.log(chalk.grey('Determining version of node'));    // eslint-disable-line no-console

  const nvmLsOutput = await exec(`. ~/.nvm/nvm.sh && nvm ls-remote${('LTS' === nodeVersionCategory) ? ' --lts' : ''}`);

  const lsLines = nvmLsOutput.split('\n');
  const lsLine = lsLines[lsLines.length - 2];

  return lsLine.match(/(v[0-9]+\.[0-9]+\.[0-9]+)/)[1];
}

export function install() {
  console.log(chalk.grey('Installing version of node using nvm'));  // eslint-disable-line no-console

  return exec('. ~/.nvm/nvm.sh && nvm install', {silent: false});
}
