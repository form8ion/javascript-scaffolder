import {questionNames as languageScaffolderPromptsQuestionNames} from '@travi/language-scaffolder-prompts';
import {questionNames as jsQuestionNames} from '@form8ion/javascript';
import {questionNames as jsScaffolderQuestionNames} from './prompts/question-names';

export * from './scaffolder';
export const questionNames = {
  ...jsQuestionNames,
  ...languageScaffolderPromptsQuestionNames,
  ...jsScaffolderQuestionNames
};
