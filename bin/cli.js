#!/usr/bin/env node

import { Command } from 'commander';
import { runAutocomment } from '../dist/index.js';

const program = new Command();

program
  .command('autocomment')
  .description(
    'Summarizes your commits using LLM and comments them in Jira ticket.'
  )
  .action(() => {
    runAutocomment();
  });

program.parse(process.argv);
