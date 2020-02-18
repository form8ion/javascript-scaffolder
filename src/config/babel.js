import {promises as fsPromises} from 'fs';
import {warn} from '@travi/cli-messages';

export default async function ({projectRoot, preset, transpileLint}) {
  if (false === transpileLint) {
    warn('Not configuring transpilation');

    return {devDependencies: [], scripts: {}, vcsIgnore: {files: [], directories: []}};
  }

  if (preset) {
    await fsPromises.writeFile(`${projectRoot}/.babelrc`, JSON.stringify({presets: [preset.name], ignore: ['./lib/']}));
  } else warn('Not configuring transpilation since no babel-config was provided');

  return {
    devDependencies: ['@babel/register', ...preset ? [preset.packageName] : []],
    scripts: {},
    vcsIgnore: {files: [], directories: []}
  };
}
