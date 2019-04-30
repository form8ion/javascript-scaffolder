import {EOL} from 'os';
import validatePackageName from '../third-party-wrappers/validate-npm-package-name';

export default function (projectName, scope) {
  const name = `${scope ? `@${scope}/` : ''}${projectName}`;

  const validationResults = validatePackageName(name);

  if (validationResults.validForNewPackages) return name;

  throw new Error(`The package name ${name} is invalid:${EOL}\t* ${validationResults.errors.join(`${EOL}\t* `)}`);
}
