import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class SbtEcsClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameter & Lookups
    const vpc_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/id');
    // L2 CDK Resources
    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      isDefault: false,
      vpcId: vpc_id
    });

    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: vpc,
      enableFargateCapacityProviders: true
    });
  }
}
