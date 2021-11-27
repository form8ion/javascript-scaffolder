import deepmerge from 'deepmerge';
import {projectTypes} from '@form8ion/javascript-core';
import {scaffold} from '@form8ion/husky';

import scaffoldCommitizen from './commitizen';
import scaffoldCommitlint from './commitlint';

export default async function ({projectRoot, projectType, configs, pathWithinParent, packageManager}) {
  const detailsForProjectsPublishedToARegistry = [projectTypes.PACKAGE, projectTypes.CLI].includes(projectType) ? {
    packageProperties: {version: '0.0.0-semantically-released'},
    badges: {
      contribution: {
        'semantic-release': {
          img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
          text: 'semantic-release: angular',
          link: 'https://github.com/semantic-release/semantic-release'
        }
      }
    }
  } : {};

  if (pathWithinParent) return detailsForProjectsPublishedToARegistry;

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
    },
    detailsForProjectsPublishedToARegistry
  ]);
}
