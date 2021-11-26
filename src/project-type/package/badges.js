export default function (packageName, visibility) {
  return {
    consumer: {
      ...'Public' === visibility && {
        npm: {
          img: `https://img.shields.io/npm/v/${packageName}.svg`,
          text: 'npm',
          link: `https://www.npmjs.com/package/${packageName}`
        }
      }
    },
    contribution: {
      'semantic-release': {
        img: 'https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release',
        text: 'semantic-release: angular',
        link: 'https://github.com/semantic-release/semantic-release'
      }
    },
    status: {}
  };
}
