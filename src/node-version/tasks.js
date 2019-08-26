import {info} from '@travi/cli-messages';
import exec from '../../third-party-wrappers/exec-as-promised';

export async function determineLatestVersionOf(nodeVersionCategory) {
  info('Determining version of node', {level: 'secondary'});

  const nvmLsOutput = await exec(`. ~/.nvm/nvm.sh && nvm ls-remote${('LTS' === nodeVersionCategory) ? ' --lts' : ''}`);

  const lsLines = nvmLsOutput.split('\n');
  const lsLine = lsLines[lsLines.length - 2];

  return lsLine.match(/(v[0-9]+)\.[0-9]+\.[0-9]+/)[1];
}

export function install(nodeVersionCategory) {
  info(`Installing ${nodeVersionCategory} version of node using nvm`, {level: 'secondary'});

  return exec('. ~/.nvm/nvm.sh && nvm install', {silent: false});
}
