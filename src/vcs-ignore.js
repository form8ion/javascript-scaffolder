export default function (contributors) {
  const vcsIgnoreLists = contributors
    .map(contributor => contributor.vcsIgnore).filter(Boolean)
    .reduce(
      (acc, {files, directories}) => ({
        files: [...acc.files, ...files || []],
        directories: [...acc.directories, ...directories || []]
      }),
      {files: [], directories: []}
    );

  return {
    files: vcsIgnoreLists.files,
    directories: ['/node_modules/', ...vcsIgnoreLists.directories]
  };
}
