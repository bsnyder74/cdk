#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SbtAmplifyAppStack } from '../lib/sbt-amplify-app-stack';

const app = new cdk.App();
new SbtAmplifyAppStack(app, 'SbtAmplifyAppStack', {
  stackName: 'sbt-amplify-app',
  description: 'Builds an Amplify App Stack',
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  }
});