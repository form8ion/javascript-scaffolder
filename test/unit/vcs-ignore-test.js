import {assert} from 'chai';
import any from '@travi/any';
import buildVcsIgnoreLists from '../../src/vcs-ignore';

suite('vcs-ignore lists builder', () => {
  const filesLists = any.listOf(() => any.listOf(any.word));
  const directoriesLists = any.listOf(() => any.listOf(any.word), {size: filesLists.length});
  const contributors = any.listOf(index => ({
    ...any.simpleObject(),
    vcsIgnore: {files: filesLists[index], directories: directoriesLists[index]}
  }), {size: filesLists.length});

  test('that default lists are defined', () => {
    assert.deepEqual(
      buildVcsIgnoreLists(contributors),
      {
        files: filesLists.reduce((acc, files) => ([...acc, ...files]), []),
        directories: [
          '/node_modules/',
          ...directoriesLists.reduce((acc, directories) => ([...acc, ...directories]), [])
        ]
      }
    );
  });

  test('that contributors without`vcsIgnore` defined do not cause an error', () => {
    buildVcsIgnoreLists([...contributors, any.simpleObject()]);
  });

  test('that contributors without`vcsIgnore.files` defined do not cause an error', () => {
    buildVcsIgnoreLists([...contributors, {...any.simpleObject(), vcsIgnore: {directories: []}}]);
  });

  test('that contributors without`vcsIgnore.directories` defined do not cause an error', () => {
    buildVcsIgnoreLists([...contributors, {...any.simpleObject(), vcsIgnore: {files: []}}]);
  });
});
