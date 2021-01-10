import buildGenerationCommand from './generation-command';

export default function ({projectTypeResults, packageManager}) {
  return {
    toc: `Run \`${buildGenerationCommand(packageManager)}\` to generate a table of contents`,
    ...projectTypeResults.documentation,
    contributing: `### Dependencies

\`\`\`sh
$ nvm install
$ ${packageManager} install
\`\`\`

### Verification

\`\`\`sh
$ ${packageManager} test
\`\`\``
  };
}
