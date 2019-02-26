import {writeFile} from 'mz/fs';

export default async function ({projectRoot}) {
  await writeFile(`${projectRoot}/.nycrc`, JSON.stringify({reporter: ['lcov', 'text-summary'], exclude: ['test/']}));

  return {devDependencies: ['nyc']};
}
