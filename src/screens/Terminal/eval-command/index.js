import * as evaluators from './evaluators';

export default async function evalCommand(input, log) {
  const [command, ...extraArgs] = input.split(' ');
  if (Object.keys(evaluators).includes(command)) {
    return await evaluators[command](extraArgs.join(' '), log);
  } else {
    log(`Command not found: ${command}`);
    return true;
  }
}
