export default function (visibility, packageType, packageName, ciService, unitTested, vcs) {
  return {
    consumer: {
      ...('Public' === visibility && 'Package' === packageType) && {
        npm: {
          img: `https://img.shields.io/npm/v/${packageName}.svg`,
          text: 'npm',
          link: `https://www.npmjs.com/package/${packageName}`
        }
      }
    },
    contribution: {
      'commit-convention': {
        img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
        text: 'Conventional Commits',
        link: 'https://conventionalcommits.org'
      },
      commitizen: {
        img: 'https://img.shields.io/badge/commitizen-friendly-brightgreen.svg',
        text: 'Commitizen friendly',
        link: 'http://commitizen.github.io/cz-cli/'
      },
      ...'Package' === packageType && {
        'semantic-release': {
          img: 'https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg',
          text: 'semantic-release',
          link: 'https://github.com/semantic-release/semantic-release'
        }
      }
    },
    status: {
      ...ciService.badge && {ci: ciService.badge},
      ...unitTested && 'Public' === visibility && vcs && 'GitHub' === vcs.host && {
        coverage: {
          img: `https://img.shields.io/codecov/c/github/${vcs.owner}/${vcs.name}.svg`,
          link: `https://codecov.io/github/${vcs.owner}/${vcs.name}`,
          text: 'Codecov'
        }
      }
    }
  };
}
