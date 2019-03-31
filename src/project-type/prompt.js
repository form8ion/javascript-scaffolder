import {prompt, Separator} from 'inquirer';

export default async function ({types}) {
  const answers = await prompt([{
    name: 'type',
    type: 'list',
    message: 'What type of application is this?',
    choices: [...Object.keys(types), new Separator(), 'Other']
  }]);

  return answers.type;
}
