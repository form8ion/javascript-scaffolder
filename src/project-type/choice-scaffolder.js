export default function (typeScaffolders, chosenType, options) {
  const type = typeScaffolders[chosenType];

  if (type) return type.scaffolder(options);

  return {scripts: {}, dependencies: [], devDependencies: [], vcsIgnore: {files: [], directories: []}};
}
