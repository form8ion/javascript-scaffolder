import {resolve} from 'path';

export default function (fileName) {
  return resolve(__dirname, '..', 'templates', fileName);
}
