import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export class SbtRdsClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Params and Lookups //
    // const private_subnet_1_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/1/id');
    // const private_subnet_2_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/2/id');
    const vpc_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/id');
    // L2 CDK Resources
    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      isDefault: false,
      vpcId: vpc_id
    });

    // Resources
    const db_cluster = new rds.DatabaseCluster(this, 'DbCluster', {
      engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_03_0 }),
      writer: rds.ClusterInstance.provisioned('writer', {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM)
      }),
      readers: [
        rds.ClusterInstance.provisioned('reader1', {
          instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM)
        })
      ],
      vpc: vpc,
      // credentials: rds.Credentials.fromGeneratedSecret('6*CHm!XuBcf6h'),
      subnetGroup: rds.SubnetGroup.fromSubnetGroupName(this, 'subnet-group', 'rds-private'),
      defaultDatabaseName: 'sbt',
      // securityGroups: ['sg-12345'],
      storageEncrypted: true,
      clusterIdentifier: 'dev-cluster-1'
    });
  }
}
