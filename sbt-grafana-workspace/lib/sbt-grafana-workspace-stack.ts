import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as grafana from 'aws-cdk-lib/aws-grafana';
import { Construct } from 'constructs';

export class SbtGrafanaWorkspaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcConfigurationProperty: grafana.CfnWorkspace.VpcConfigurationProperty = {
      securityGroupIds: ['sg-0ead1169c9d79739a'],
      subnetIds: ['subnet-060dd5f164f9958fd', 'subnet-063ca92cdc1851aec', 'subnet-0af3085bbb9754922']
    };

    const grafana_workspace = new grafana.CfnWorkspace(this, 'GrafanaWorkspace', {
      accountAccessType: 'CURRENT_ACCOUNT',
      authenticationProviders: ['AWS_SSO'],
      permissionType: 'SERVICE_MANAGED',
      grafanaVersion: '9.4',
      name: 'dev-workspace',
      roleArn: 'arn:aws:iam::540796455178:role/aws-service-role/grafana.amazonaws.com/AWSServiceRoleForAmazonGrafana',
      vpcConfiguration: vpcConfigurationProperty
    });
  }
}
