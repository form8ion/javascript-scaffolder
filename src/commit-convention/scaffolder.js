import scaffoldCommitizen from '../config/commitizen';
import scaffoldHusky from '../config/husky';
import scaffoldCommitlint from './commitlint';

export default async function ({projectRoot, configs}) {
  const [huskyResults, commitizenResults, commitlintResults] = await Promise.all([
    scaffoldHusky({projectRoot}),
    scaffoldCommitizen({projectRoot}),
    configs.commitlint && scaffoldCommitlint({projectRoot, config: configs.commitlint})
  ]);

  return {
    devDependencies: [
      ...commitizenResults.devDependencies,
      ...huskyResults.devDependencies,
      ...commitlintResults ? commitlintResults.devDependencies : []
    ],
    scripts: {...commitizenResults.scripts, ...huskyResults.scripts},
    vcsIgnore: {files: [], directories: []}
  };
}
