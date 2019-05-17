export default function (contributors) {
  return {
    files: contributors
      .map(contributor => contributor.vcsIgnore.files)
      .reduce((acc, files) => ([...acc, ...files]), []),
    directories: [
      '/node_modules/',
      ...contributors
        .map(contributor => contributor.vcsIgnore.directories)
        .reduce((acc, directories) => ([...acc, ...directories]), [])
    ]
  };
}
