import scaffoldBabel from './babel';

export default function ({dialect, projectRoot, configs, transpileLint, tests, buildDirectory}) {
  if ('babel' === dialect) {
    return scaffoldBabel({preset: configs.babelPreset, projectRoot, transpileLint, tests, buildDirectory});
  }

  return {};
}
