#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SbtRdsConfigGroupsStack } from '../lib/sbt-rds-config-groups-stack';

const app = new cdk.App();
new SbtRdsConfigGroupsStack(app, 'SbtRdsConfigGroupsStack', {
  stackName: 'sbt-rds-config-groups',
  description: 'Builds an RDS Configuration Options Stack',
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  }
});