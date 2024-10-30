#!/usr/bin/env node
import 'source-map-support/register';
import path from 'path';
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { GenAINewsletter } from '../lib';
import { addNagSuppressions } from '../lib/cdk-nag-supressions';
import getConfig from '../lib/config';


const app = new App();

const config = getConfig(path.join(__dirname, 'config.json'));
const baseName = config.stackName ?? 'GenAINewsletter';

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const genAiNewsletterApp = new GenAINewsletter(app, baseName);

addNagSuppressions(genAiNewsletterApp);
