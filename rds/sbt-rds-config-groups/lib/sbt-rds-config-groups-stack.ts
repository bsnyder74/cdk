import * as cdk from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_rds as rds } from 'aws-cdk-lib';
import { Construct } from 'constructs';

declare const instance_parameters: any;
declare const cluter_parameters: any;

export class SbtRdsConfigGroupsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lookups //
    const private_subnet_1_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/1/id');
    const private_subnet_2_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/2/id');
    const private_subnet_3_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/3/id');

    // Resources //
    // Subnet Groups
    const privateDBSubnetGroup = new rds.CfnDBSubnetGroup(this, 'PrivateCfnDBSubnetGroup', {
      dbSubnetGroupDescription: 'Private RDS Subnet Group',
      subnetIds: [private_subnet_1_id, private_subnet_2_id, private_subnet_3_id],
      dbSubnetGroupName: 'rds-private',
      tags: [{
        key: 'Owner',
        value: 'brian',
      }],
    });

    // Parameter Groups
    // Cluster
    const cfnDBClusterParameterGroup = new rds.CfnDBClusterParameterGroup(this, 'AuroraDBClusterParameterGroup', {
      description: 'Cluster Parameter Group for Aurora MySQL 8.0',
      family: 'aurora-mysql8.0',
      parameters:
      {
        character_set_database: 'utf8',
        binlog_format: 'ROW',
        binlog_row_metadata: 'minimal'
      },
      dbClusterParameterGroupName: 'sbt-aurora-mysql8-0',
      tags: [{
        key: 'Owner',
        value: 'brian',
      }],
    });

    // DB Instance
    const AuroraDBParameterGroup = new rds.CfnDBParameterGroup(this, 'AuroraDBParameterGroup', {
      description: 'DB Instance Parameter Group for Aurora MySQL 8.0',
      family: 'aurora-mysql8.0',
      dbParameterGroupName: 'sbt-aurora-mysql8-0',
      // parameters: parameters,
      tags: [{
        key: 'Owner',
        value: 'brian',
      }],
    });

    // Option Groups
  }
}
