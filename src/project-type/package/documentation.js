import buildGenerationCommand from '../../documentation/generation-command';

export default function ({scope, packageName, packageManager, visibility}) {
  return {
    usage: `### Installation
${'Private' === visibility ? `
:warning: this is a private package, so you will need to use an npm token with
access to private packages under \`@${scope}\`
` : ''
}
\`\`\`sh
$ npm install ${packageName}
\`\`\`

### Example

run \`${buildGenerationCommand(packageManager)}\` to inject the usage example`
  };
}
