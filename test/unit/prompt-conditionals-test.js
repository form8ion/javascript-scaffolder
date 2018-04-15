import any from '@travi/any';
import {assert} from 'chai';
import {
  shouldBeScopedPromptShouldBePresented,
  scopePromptShouldBePresented
} from '../../src/prompt-condiftionals';
import {questionNames} from '../../src/scaffolder';

suite('javascript prompt conditionals', () => {
  suite('scope', () => {
    test('that whether the package should be scoped is presented for packages', () => {
      assert.isTrue(shouldBeScopedPromptShouldBePresented({[questionNames.PACKAGE_TYPE]: 'Package'}));
    });

    test('that whether the package should be scoped is not presented for non-packages', () => {
      assert.isFalse(shouldBeScopedPromptShouldBePresented({[questionNames.PACKAGE_TYPE]: any.string()}));
    });

    test('that a scope is presented when a package should be scoped', () => {
      assert.isTrue(scopePromptShouldBePresented({[questionNames.SHOULD_BE_SCOPED]: true}));
    });

    test('that a scope is not presented for non-packages', () => {
      assert.isFalse(scopePromptShouldBePresented({[questionNames.SHOULD_BE_SCOPED]: false}));
    });
  });
});
