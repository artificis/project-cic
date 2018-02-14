import evaluators from './evaluators';

export default function evalCommand(input, log) {
  const [commandString, ...args] = input.split(' ');
  const command = commandString.toLowerCase();

  if (Object.keys(evaluators).includes(command)) {
    return evaluators[command]({
      log,
      args: args.filter(e => e !== '')
    });
  }

  log(`command not found: ${command}`);
  return true;
}
