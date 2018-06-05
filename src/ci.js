export default function (scaffolders, chosenService, options) {
  const scaffolder = scaffolders[chosenService];

  if (scaffolder) return scaffolder(options);

  return undefined;
}
