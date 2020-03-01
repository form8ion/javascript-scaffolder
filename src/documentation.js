export default function ({projectTypeResults}) {
  return {
    toc: '',
    ...projectTypeResults.documentation,
    contributing: `### Dependencies

\`\`\`sh
$ nvm install
$ npm install
\`\`\`

### Verification

\`\`\`sh
$ npm test
\`\`\``
  };
}
