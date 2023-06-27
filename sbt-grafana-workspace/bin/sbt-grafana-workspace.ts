#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SbtGrafanaWorkspaceStack } from '../lib/sbt-grafana-workspace-stack';

const app = new cdk.App();
new SbtGrafanaWorkspaceStack(app, 'SbtGrafanaWorkspaceStack', {
  stackName: 'sbt-grafana-workspace',
  description: 'Builds an Grafana Workspace Stack',
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  }
});