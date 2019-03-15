import {assert} from 'chai';
import any from '@travi/any';
import buildVcsIgnoreLists from '../../src/vcs-ignore';

suite('vcs-ignore lists builder', () => {
  const hostDirectories = any.listOf(any.string);
  const lintingFiles = any.listOf(any.string);
  const host = {vcsIgnore: {directories: hostDirectories}};
  const linting = {vcsIgnore: {files: lintingFiles}};

  test('that default lists are defined', () => {
    assert.deepEqual(
      buildVcsIgnoreLists({host, linting}),
      {
        files: [...lintingFiles],
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
    const ignores = buildVcsIgnoreLists({host, linting, projectType: 'Application'});

    assert.include(ignores.files, '.env');
  });
});
