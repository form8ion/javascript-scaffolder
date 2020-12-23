import {info} from '@travi/cli-messages';
import execa from '../../third-party-wrappers/execa';

export async function determineLatestVersionOf(nodeVersionCategory) {
  info('Determining version of node', {level: 'secondary'});

  const {stdout: nvmLsOutput} = await execa(
    `. ~/.nvm/nvm.sh && nvm ls-remote${('LTS' === nodeVersionCategory) ? ' --lts' : ''}`,
    {shell: true}
  );

  const lsLines = nvmLsOutput.split('\n');
  const lsLine = lsLines[lsLines.length - 2];

  return lsLine.match(/(v[0-9]+)\.[0-9]+\.[0-9]+/)[1];
}

export function install(nodeVersionCategory) {
  info(`Installing ${nodeVersionCategory} version of node using nvm`, {level: 'secondary'});

  const subprocess = execa('. ~/.nvm/nvm.sh && nvm install', {shell: true});
  subprocess.stdout.pipe(process.stdout);
  return subprocess;
}
