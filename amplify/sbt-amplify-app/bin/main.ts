#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SbtAmplifyAppStack } from '../lib/sbt-amplify-app-stack';
import { SbtAmplifyDomainStack } from "../lib/sbt-amplify-domain-stack";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
const dotenvFile = process.env.DOTENV_FILE || '.env';
dotenv.config({ path: dotenvFile });

// List of required environment variables
const requiredEnvVars = [
  'APP_STACK_NAME',
  'APP_NAME',
  'REPO_URL',
  'BRANCH_NAME',
  'AUTO_BUILD',
  'OWNER',
  'COST_CENTER'
];

// Check if all required environment variables are set
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is not set. Please check your .env file or environment configuration.`);
  }
});

const app = new cdk.App();
new SbtAmplifyAppStack(app, 'SbtAmplifyAppStack', {
  description: 'Builds an Amplify App Stack',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  stackName: process.env.APP_STACK_NAME!,
  appName: process.env.APP_NAME!,
  repoUrl: process.env.REPO_URL!,
  branchName: process.env.BRANCH_NAME!,
  autoBuild: process.env.AUTO_BUILD?.toLowerCase() === 'true', // Convert to boolean
  tags: {
    owner: process.env.OWNER!,
    costCenter: process.env.COST_CENTER!
  },
  owner: process.env.OWNER!,
  costCenter: process.env.COST_CENTER!,
  githubTokenSecretName: process.env.GITHUB_TOKEN_SECRET_NAME!
});

new SbtAmplifyDomainStack(app, 'SbtAmplifyDomainStack', {
  description: 'Builds an Amplify Domain Stack',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  stackName: process.env.DOMAIN_STACK_NAME!,
  appId: process.env.APP_ID!,
  domainName: process.env.DOMAIN_NAME!,
  branchName: process.env.BRANCH_NAME!,
  tags: {
    owner: process.env.OWNER!,
    costCenter: process.env.COST_CENTER!
  },
});