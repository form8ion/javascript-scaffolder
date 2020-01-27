export default function (visibility, vcs) {
  return {
    badges: {
      contribution: {
        ...'Public' === visibility && vcs && 'GitHub' === vcs.host && {
          greenkeeper: {
            img: `https://badges.greenkeeper.io/${vcs.owner}/${vcs.name}.svg`,
            text: 'Greenkeeper',
            link: 'https://greenkeeper.io/'
          }
        }
      }
    },
    nextSteps: [
      ...('Public' === visibility && vcs && 'GitHub' === vcs.host)
        ? [{summary: 'Register the greenkeeper-keeper webhook'}]
        : []
    ]
  };
}
