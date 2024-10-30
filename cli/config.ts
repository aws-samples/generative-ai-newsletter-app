// config.ts
import figlet from 'figlet';
import prompt from 'prompt-sync';
import { interactiveManage } from './config-manage';
import { showConfig } from './config-show';
import { formatText } from './consts';

const prompter = prompt({ sigint: true });

console.log(
  figlet.textSync('GenAI Newsletter', {
    font: 'Slant',
  }),
);

// Main interactive menu
async function mainMenu(): Promise<void> {
  let exit = false;
  while (!exit) {
    console.log(formatText('\nWhat would you like to do?', { bold: true }));
    console.log(
      '   ▶️ (' +
      formatText('m', { textColor: 'green' }) +
      ') ' +
      formatText('MANAGE', { textColor: 'green' }) +
      ' configuration\n' +
      '   ▶️ (' +
      formatText('s', { textColor: 'blue' }) +
      ') ' +
      formatText('SHOW', { textColor: 'blue' }) +
      ' current configuration\n' +
      '   ▶️ (' +
      formatText('x', { textColor: 'red' }) +
      ') ' +
      formatText('EXIT', { textColor: 'red' }),
    );

    const choice = prompter(formatText('(M/s/x):', { bold: true }), 'm');

    switch (choice.toLowerCase()) {
      case 'm':
        await interactiveManage();
        break;
      case 's':
        showConfig();
        break;
      case 'x':
        exit = true;
        break;
      default:
        console.log(
          formatText('Invalid Input!', {
            bold: true,
            backgroundColor: 'bg-red',
            textColor: 'white',
          }),
        );
    }
  }
}

// Start the CLI
mainMenu().catch(console.error);