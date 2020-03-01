export default function ({projectTypeResults}) {
  return {
    toc: 'Run `npm run generate:md` to generate a table of contents',
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
