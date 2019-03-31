export default function (typeScaffolders, chosenType, options) {
  const typeScaffolder = typeScaffolders[chosenType];

  if (typeScaffolder) return typeScaffolder(options);

  return {scripts: {}, dependencies: [], devDependencies: [], vcsIgnore: {files: [], directories: []}};
}
