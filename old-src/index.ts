import * as commands from './commands';

const command = process.argv[2];

if (!command || !Object.keys(commands).includes(command)) {
  console.error(`No command was passed or that command is not available. Available commands: ${Object.keys(commands).join(', ')}.`);
}

type CommandsType = typeof commands;

(async () => {
  await commands[command as keyof CommandsType]();
})();
