import {writeFile} from 'mz/fs';

export default async function ({projectRoot, vcs, visibility}) {
  await writeFile(
    `${projectRoot}/.nycrc`,
    JSON.stringify({
      reporter: ['lcov', 'text-summary', 'html'],
      exclude: ['src/**/*-test.js', 'test/', 'thirdparty-wrappers/', 'vendor/']
    })
  );

  return {
    devDependencies: ['nyc'],
    vcsIgnore: {files: [], directories: ['/coverage/', '/.nyc_output/']},
    badges: {
      status: {
        ...vcs && 'GitHub' === vcs.host && 'Public' === visibility && {
          coverage: {
            img: `https://img.shields.io/codecov/c/github/${vcs.owner}/${vcs.name}.svg`,
            link: `https://codecov.io/github/${vcs.owner}/${vcs.name}`,
            text: 'Codecov'
          }
        }
      }
    }
  };
}
