import {promises as fsPromises} from 'fs';
import {warn} from '@travi/cli-messages';

export default async function ({projectRoot, preset, transpileLint, tests, buildDirectory}) {
  if (false === transpileLint || !preset) {
    warn('Not configuring transpilation');

    return {devDependencies: [], scripts: {}, vcsIgnore: {files: [], directories: []}};
  }

  await fsPromises.writeFile(
    `${projectRoot}/.babelrc`,
    JSON.stringify({
      presets: [preset.name],
      ignore: [`./${buildDirectory}/`],
      ...tests.unit && {env: {test: {plugins: ['istanbul']}}}
    })
  );

  return {
    devDependencies: [
      '@babel/register',
      preset.packageName,
      ...tests.unit ? ['babel-plugin-istanbul'] : []
    ]
  };
}
