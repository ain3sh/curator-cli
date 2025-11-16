#!/usr/bin/env node

import { Command } from 'commander';
import { curate } from './commands/curate';
import { configCommand } from './commands/config';
import { listCommand } from './commands/list';
import { cleanCommand } from './commands/clean';

const program = new Command();

program
  .name('curate')
  .description('Blazing fast CLI to curate web content as clean markdown')
  .version('0.1.0');

// Main curate command
program
  .argument('<url...>', 'URL(s) to fetch and convert to markdown')
  .option('-o, --output <dir>', 'Output directory')
  .option('-n, --name <name>', 'Custom filename (without .md extension, only works with single URL)')
  .option('--full', 'Include headers, navs, footers (default: main content only)')
  .option('--refresh', 'Refresh cached content')
  .option('--media', 'Download and save images from the page')
  .action(async (urls: string[], options: any) => {
    try {
      await curate(urls, options);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Configure curator settings')
  .action(async () => {
    try {
      await configCommand();
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('Show cached content')
  .action(() => {
    try {
      listCommand();
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Clean command
program
  .command('clean')
  .description('Clear cache')
  .action(async () => {
    try {
      await cleanCommand();
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
