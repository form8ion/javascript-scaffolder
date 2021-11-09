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
        img: 'https://img.shields.io/badge/semantic-release-e10079.svg?logo=semantic-release',
        text: 'semantic-release',
        link: 'https://github.com/semantic-release/semantic-release'
      }
    },
    status: {}
  };
}
