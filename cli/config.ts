import { Command } from 'commander'
import { CONFIG_VERSION } from './config-version'
import figlet from 'figlet'

const program = new Command()

console.log(figlet.textSync('GenAI Newsletter', {
  font: 'Slant'
}))

program
  .name('npm run config')
  .description(
    'CLI utility for creating, viewing, and updating you GenAI Newsletter deployment configuration.'
  )
  .version(CONFIG_VERSION)
  .configureOutput({
    writeOut: (str) => {
      try {
        const config = JSON.parse(str)
        console.log(JSON.stringify(config, null, '\t'))
      } catch (e) {
        console.log(str)
      }
    }
  })

program
  .command('show', '🖨️ Show the current deployment configuration details')
  .description('Show the current deployment configuration details')

program
  .command('manage', '📝 Create or Manage the deployment configuration')
  .description('Create a new deployment configuration')

program.parse()
