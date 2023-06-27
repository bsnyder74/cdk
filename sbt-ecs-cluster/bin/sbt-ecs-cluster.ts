#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SbtEcsClusterStack } from '../lib/sbt-ecs-cluster-stack';

const app = new cdk.App();
new SbtEcsClusterStack(app, 'SbtEcsClusterStack', {
  stackName: 'sbt-ecs-stack',
  description: 'Builds an ECS Cluster Stack',
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  }
});