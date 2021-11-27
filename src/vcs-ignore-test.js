import {assert} from 'chai';
import any from '@travi/any';
import buildVcsIgnoreLists from './vcs-ignore';

suite('vcs-ignore lists builder', () => {
  const vcsIgnore = {files: any.listOf(any.word), directories: any.listOf(any.word)};

  test('that default lists are defined', () => {
    assert.deepEqual(
      buildVcsIgnoreLists(vcsIgnore),
      {files: vcsIgnore.files, directories: ['/node_modules/', ...vcsIgnore.directories]}
    );
  });

  test('that the default file list is empty', () => {
    assert.deepEqual(buildVcsIgnoreLists({...vcsIgnore, files: undefined}).files, []);
  });

  test('that the default directories list contains `node_modules`', () => {
    assert.deepEqual(buildVcsIgnoreLists({...vcsIgnore, directories: undefined}).directories, ['/node_modules/']);
  });

  test('that missing ignores produce defaults', () => {
    assert.deepEqual(buildVcsIgnoreLists(), {files: [], directories: ['/node_modules/']});
  });
});
