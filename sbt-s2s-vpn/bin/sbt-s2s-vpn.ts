#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SbtS2SVpnStack } from '../lib/sbt-s2s-vpn-stack';

const app = new cdk.App();
new SbtS2SVpnStack(app, 'SbtS2SVpnStack', {
  stackName: 'sbt-s2s-vpn',
  description: 'Builds an Site to site VPN Stack',
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
  }
});