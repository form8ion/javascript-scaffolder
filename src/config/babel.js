import {writeFile} from 'mz/fs';

export default async function ({projectRoot, preset}) {
  if (preset) await writeFile(`${projectRoot}/.babelrc`, JSON.stringify({presets: [preset.name]}));

  return {
    devDependencies: ['@babel/register', ...preset ? [preset.packageName] : []],
    scripts: {},
    vcsIgnore: {files: [], directories: []}
  };
}
