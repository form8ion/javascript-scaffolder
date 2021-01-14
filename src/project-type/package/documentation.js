import {packageManagers} from '@form8ion/javascript-core';
import buildGenerationCommand from '../../documentation/generation-command';

function getInstallationCommand(packageManager) {
  if (packageManagers.NPM === packageManager) return 'npm install';
  if (packageManagers.YARN === packageManager) return 'yarn add';

  throw new Error(
    `The ${packageManager} package manager is currently not supported. `
    + `Only ${Object.values(packageManagers).join(' and ')} are currently supported.`
  );
}

export default function ({scope, packageName, packageManager, visibility}) {
  return {
    usage: `### Installation
${'Private' === visibility ? `
:warning: this is a private package, so you will need to use an npm token with
access to private packages under \`@${scope}\`
` : ''
}
\`\`\`sh
$ ${getInstallationCommand(packageManager)} ${packageName}
\`\`\`

### Example

run \`${buildGenerationCommand(packageManager)}\` to inject the usage example`
  };
}
