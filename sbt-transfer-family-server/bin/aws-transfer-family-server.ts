#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsTransferFamilyServerStack } from '../lib/aws-transfer-family-server-stack';

const app = new cdk.App();
new AwsTransferFamilyServerStack(app, 'AwsTransferFamilyServerStack', {
  stackName: 'sbt-transfer-family-server',
  description: 'Builds an AWS Transfer Family Server Stack',
  //env: { account: '127615680274', region: 'us-west-2' }
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  }
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});