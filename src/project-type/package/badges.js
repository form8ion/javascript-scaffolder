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
        img: 'https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg',
        text: 'semantic-release',
        link: 'https://github.com/semantic-release/semantic-release'
      }
    },
    status: {}
  };
}
