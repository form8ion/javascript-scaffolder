import {assert} from 'chai';
import any from '@travi/any';
import buildVcsIgnoreLists from '../../src/vcs-ignore';

suite('vcs-ignore lists builder', () => {
  const hostDirectories = any.listOf(any.string);
  const eslintFiles = any.listOf(any.string);
  const host = {vcsIgnore: {directories: hostDirectories}};
  const eslint = {vcsIgnore: {files: eslintFiles}};

  test('that default lists are defined', () => {
    assert.deepEqual(
      buildVcsIgnoreLists({host, eslint}),
      {
        files: [...eslintFiles],
        directories: [
          '/node_modules/',
          '/lib/',
          '/coverage/',
          '/.nyc_output/',
          ...hostDirectories
        ]
      }
    );
  });

  test('that application-specific exclusions are defined for application projects', () => {
    const ignores = buildVcsIgnoreLists({host, eslint, projectType: 'Application'});

    assert.include(ignores.files, '.env');
  });
});
