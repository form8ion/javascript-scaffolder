import {info, warn} from '@travi/cli-messages';
import execa from 'execa';

export default async function (dependencies, dependenciesType) {
  if (dependencies.length) {
    info(`Installing ${dependenciesType} dependencies`, {level: 'secondary'});

    await execa.shell(`. ~/.nvm/nvm.sh && nvm use && npm install ${dependencies.join(' ')} --save-${dependenciesType}`);
  }

  warn(`No ${dependenciesType} dependencies to install`);
}
