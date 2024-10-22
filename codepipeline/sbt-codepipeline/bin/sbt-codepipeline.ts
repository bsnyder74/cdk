#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SbtCodepipelineStack } from '../lib/sbt-codepipeline-stack';

const app = new cdk.App();
new SbtCodepipelineStack(app, 'SbtCodepipelineStack', {
  stackName: 'sbt-brian-pipeline',
  description: 'Builds an Codepipeline Stack',
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  }
});