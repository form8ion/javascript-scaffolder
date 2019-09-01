import scaffoldPackageDocumentation from './project-type/package/documentation';

export default function ({projectType, packageName, visibility, scope}) {
  return {
    ...'Package' === projectType && scaffoldPackageDocumentation({packageName, visibility, scope}),
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
