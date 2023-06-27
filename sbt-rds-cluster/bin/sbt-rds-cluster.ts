#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SbtRdsClusterStack } from '../lib/sbt-rds-cluster-stack';

const app = new cdk.App();
new SbtRdsClusterStack(app, 'SbtRdsClusterStack', {
  stackName: 'sbt-rds-cluster',
  description: 'Builds an RDS Cluster Stack',
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  }
});