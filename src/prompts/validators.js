export function scope(visibility) {
  return input => {
    if (!input && 'Private' === visibility) {
      return 'Private packages must be scoped (https://docs.npmjs.com/private-modules/intro#setting-up-your-package)';
    }

    return true;
  };
}
