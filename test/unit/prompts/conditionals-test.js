import any from '@travi/any';
import {assert} from 'chai';
import {
  packageTypeIsApplication,
  shouldBeScopedPromptShouldBePresented,
  scopePromptShouldBePresentedFactory
} from '../../../src/prompts/conditionals';
import {questionNames} from '../../../src/prompts/question-names';

suite('javascript prompt conditionals', () => {
  suite('scope', () => {
    test('that whether the package should be scoped is presented for packages', () => {
      assert.isTrue(shouldBeScopedPromptShouldBePresented({[questionNames.PACKAGE_TYPE]: 'Package'}));
    });

    test('that whether the package should be scoped is not presented for non-packages', () => {
      assert.isFalse(shouldBeScopedPromptShouldBePresented({[questionNames.PACKAGE_TYPE]: any.string()}));
    });

    test('that a scope is presented when a package should be scoped', () => {
      assert.isTrue(scopePromptShouldBePresentedFactory()({
        [questionNames.SHOULD_BE_SCOPED]: true,
        [questionNames.PACKAGE_TYPE]: 'Package'
      }));
    });

    test('that a scope is presented when a package is private, because they must be scoped', () => {
      assert.isTrue(scopePromptShouldBePresentedFactory('Private')({
        [questionNames.SHOULD_BE_SCOPED]: false,
        [questionNames.PACKAGE_TYPE]: 'Package'
      }));
    });

    test('that a scope is not presented when an app is private', () => {
      assert.isFalse(scopePromptShouldBePresentedFactory('Private')({
        [questionNames.SHOULD_BE_SCOPED]: false,
        [questionNames.PACKAGE_TYPE]: 'Application'
      }));
    });

    test('that a scope is not presented for non-packages', () => {
      assert.isFalse(scopePromptShouldBePresentedFactory()({[questionNames.SHOULD_BE_SCOPED]: false}));
    });
  });

  suite('application', () => {
    test('that `true` is returned when the package-type is `Application`', () => {
      assert.isTrue(packageTypeIsApplication({[questionNames.PACKAGE_TYPE]: 'Application'}));
    });

    test('that `false` is returned when the package-type is not `Application`', () => {
      assert.isFalse(packageTypeIsApplication({[questionNames.PACKAGE_TYPE]: any.word()}));
    });
  });
});
