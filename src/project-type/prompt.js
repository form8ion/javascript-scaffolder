import {prompt, Separator} from 'inquirer';

export default function ({types}) {
  return prompt([{
    name: 'types',
    type: 'list',
    message: 'What type of application is this?',
    choices: [...Object.keys(types), new Separator(), 'Other']
  }]);
}
