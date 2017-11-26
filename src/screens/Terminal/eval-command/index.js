import evaluators from './evaluators';

export default function evalCommand(input, log) {
  let [command, ...args] = input.split(' ');
  
  command = command.toLowerCase();
  if (Object.keys(evaluators).includes(command)) {
    return evaluators[command]({
      log,
      args: args.filter(e => e !== '')
    });
  } else {
    log(`Command not found: ${command}`);
    return true;
  }
}
