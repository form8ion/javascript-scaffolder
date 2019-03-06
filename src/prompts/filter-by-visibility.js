export default function (choices, visibility) {
  return Object.entries(choices)
    .filter(([, choice]) => choice[visibility.toLowerCase()])
    .reduce((acc, [name, choice]) => ({...acc, [name]: choice}), {});
}
