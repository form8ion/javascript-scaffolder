import deepmerge from 'deepmerge';
import {scaffold} from '@form8ion/husky';
import scaffoldCommitizen from '../config/commitizen';
import scaffoldCommitlint from './commitlint';

export default async function ({projectRoot, configs, pathWithinParent, packageManager}) {
  if (pathWithinParent) return {};

  const [commitizenResults, commitlintResults] = await Promise.all([
    scaffoldCommitizen({projectRoot}),
    configs.commitlint && scaffoldCommitlint({projectRoot, config: configs.commitlint})
  ]);

  const huskyResults = await scaffold({projectRoot, packageManager});

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
