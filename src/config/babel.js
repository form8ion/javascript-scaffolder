import {writeFile} from 'mz/fs';

export default async function ({projectRoot, preset, transpileLint}) {
  if (false === transpileLint) return {devDependencies: [], scripts: {}, vcsIgnore: {files: [], directories: []}};

  if (preset) await writeFile(`${projectRoot}/.babelrc`, JSON.stringify({presets: [preset.name]}));

  return {
    devDependencies: ['@babel/register', ...preset ? [preset.packageName] : []],
    scripts: {},
    vcsIgnore: {files: [], directories: []}
  };
}
