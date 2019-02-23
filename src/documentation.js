export default function ({projectType, packageName, visibility, scope}) {
  return {
    ...'Package' === projectType && {
      usage: `### Installation
${'Private' === visibility ? `
:warning: this is a private package, so you will need to use an npm token with
access to private packages under \`@${scope}\`
` : ''
}
\`\`\`sh
$ npm install ${packageName}
\`\`\``
    },
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
