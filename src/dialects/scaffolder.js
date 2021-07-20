import scaffoldBabel from './babel';

export default function ({projectRoot, configs, transpileLint, tests, buildDirectory}) {
  return scaffoldBabel({preset: configs.babelPreset, projectRoot, transpileLint, tests, buildDirectory});
}
