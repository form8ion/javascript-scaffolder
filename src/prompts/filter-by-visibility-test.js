import any from '@travi/any';
import {assert} from 'chai';
import filterChoices from './filter-by-visibility';

suite('choices visibility filter', () => {
  const publicChoices = any.objectWithKeys(
    any.listOf(any.word),
    {factory: () => ({...any.simpleObject(), public: true})}
  );
  const privateChoices = any.objectWithKeys(
    any.listOf(any.word),
    {factory: () => ({...any.simpleObject(), private: true})}
  );
  const choices = {...publicChoices, ...privateChoices};

  test('that public choices are listed when visibility is `Public`', () => {
    assert.deepEqual(filterChoices(choices, 'Public'), publicChoices);
  });

  test('that private choices are listed when visibility is `Private`', () => {
    assert.deepEqual(filterChoices(choices, 'Private'), privateChoices);
  });
});
