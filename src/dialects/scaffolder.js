import scaffoldBabel from './babel';

export default function ({dialect, projectRoot, configs, tests, buildDirectory}) {
  if ('babel' === dialect) {
    return scaffoldBabel({preset: configs.babelPreset, projectRoot, tests, buildDirectory});
  }

  return {};
}
