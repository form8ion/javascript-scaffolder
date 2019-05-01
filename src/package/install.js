import {info} from '@travi/cli-messages';
import execa from 'execa';

export default async function (dependencies) {
  if (dependencies.length) {
    const dependenciesType = 'dev';

    info(`Installing ${dependenciesType} dependencies`, {level: 'secondary'});

    await execa.shell(`. ~/.nvm/nvm.sh && nvm use && npm install ${dependencies.join(' ')} --save-${dependenciesType}`);
  }
}
