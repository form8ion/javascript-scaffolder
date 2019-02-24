export default function (services, chosenService, options) {
  const service = services[chosenService];

  if (service) return service.scaffolder(options);

  return {devDependencies: []};
}
