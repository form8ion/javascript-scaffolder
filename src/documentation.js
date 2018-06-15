export default function ({packageType, packageName}) {
  return {
    ...'Package' === packageType && {
      usage: `### Installation

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
