export default function (contributors) {
  return {
    consumer: contributors
      .map(contributor => contributor.badges && contributor.badges.consumer)
      .reduce((acc, badges) => ({...acc, ...badges}), {}),
    contribution: contributors
      .map(contributor => contributor.badges && contributor.badges.contribution)
      .reduce((acc, badges) => ({...acc, ...badges}), {}),
    status: contributors
      .map(contributor => contributor.badges && contributor.badges.status)
      .reduce((acc, badges) => ({...acc, ...badges}), {})
  };
}
