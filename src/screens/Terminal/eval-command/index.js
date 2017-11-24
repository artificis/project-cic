import * as evaluators from './evaluators';

export default function evalCommand(input, log) {
  const [command, ...extraArgs] = input.split(' ');
  if (Object.keys(evaluators).includes(command)) {
    return evaluators[command](extraArgs.join(' '), log);
  } else {
    log(`Command not found: ${command}`);
    return true;
  }
}
