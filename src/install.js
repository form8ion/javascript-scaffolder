import exec from '../third-party-wrappers/exec-as-promised';

export default async function (dependencies) {
  if (dependencies.length) {
    await exec(`. ~/.nvm/nvm.sh && nvm use && npm install ${dependencies.join(' ')} --save-dev`, {silent: false});
  }
}
