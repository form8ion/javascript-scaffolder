export default function (hosts, chosenHost, options) {
  const host = hosts[chosenHost];

  if (host) return host.scaffolder(options);

  return {};
}
