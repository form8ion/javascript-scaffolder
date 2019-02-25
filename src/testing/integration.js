import scaffoldCucumber from './cucumber';

export default async function ({projectRoot}) {
  const cucumber = await scaffoldCucumber({projectRoot});

  return {devDependencies: [...cucumber.devDependencies]};
}
