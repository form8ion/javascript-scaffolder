import deepmerge from 'deepmerge';
import scaffoldCommitizen from '../config/commitizen';
import scaffoldHusky from '../config/husky';
import scaffoldCommitlint from './commitlint';

export default async function ({projectRoot, configs, pathWithinParent}) {
  if (pathWithinParent) return {};

  const [huskyResults, commitizenResults, commitlintResults] = await Promise.all([
    scaffoldHusky({projectRoot}),
    scaffoldCommitizen({projectRoot}),
    configs.commitlint && scaffoldCommitlint({projectRoot, config: configs.commitlint})
  ]);

  return deepmerge.all([
    commitizenResults,
    huskyResults,
    ...commitlintResults ? [commitlintResults] : [],
    {
      vcsIgnore: {files: [], directories: []},
      badges: {
        contribution: {
          'commit-convention': {
            img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
            text: 'Conventional Commits',
            link: 'https://conventionalcommits.org'
          }
        }
      }
    }
  ]);
}
