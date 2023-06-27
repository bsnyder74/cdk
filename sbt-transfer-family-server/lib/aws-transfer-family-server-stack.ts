import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import { aws_transfer as transfer } from 'aws-cdk-lib';

export class AwsTransferFamilyServerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Params and Lookups //
    const private_subnet_1_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/1/id');
    const private_subnet_2_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/2/id');
    const vpc_id = ssm.StringParameter.valueForStringParameter(this, '/sbt/vpc/id');
    const sftp_pl = ssm.StringParameter.valueForStringParameter(this, '/sbt/vpc/prefixlist/sftp/id');


    const role = new iam.Role(this, 'SbtTransferFamilyLoggingRole', {
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSTransferLoggingAccess'),
      ],
      assumedBy: new iam.ServicePrincipal('transfer.amazonaws.com')
    });

    const sftpSg = new ec2.CfnSecurityGroup(this, 'sftpSg', {
      groupDescription: 'Allows customers access to SFTP server',
      groupName: 'PROD-SFTP-SG',
      securityGroupIngress: [{
        ipProtocol: 'tcp',
        fromPort: 22,
        toPort: 22,
        sourcePrefixListId: sftp_pl
      }],
      vpcId: vpc_id,
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'prod-sftp-sg'
      }]

    });

    const eip1 = new ec2.CfnEIP(this, 'sftpEIP1', {
      domain: 'vpc',
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'sftpEIP1'
      }]
    });

    const eip2 = new ec2.CfnEIP(this, 'sftpEIP2', {
      domain: 'vpc',
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'sftpEIP2'
      }]
    });

    const cfnServer = new transfer.CfnServer(this, 'SbtTransferServer', {
      domain: 'S3',
      endpointDetails: {
        addressAllocationIds: [eip1.attrAllocationId, eip2.attrAllocationId],
        securityGroupIds: [sftpSg.attrGroupId],
        subnetIds: [private_subnet_1_id, private_subnet_2_id],
        vpcId: vpc_id,
      },
      endpointType: 'VPC',
      identityProviderType: 'SERVICE_MANAGED',
      loggingRole: role.roleArn,
      preAuthenticationLoginBanner: 'This system is for the use of authorized users only. Individuals using this computer system without authority, or in excess of their authority, are subject to having all of their activities on this system monitored and recorded by system personnel.',
      protocols: ['SFTP'],
      securityPolicyName: 'TransferSecurityPolicy-2022-03',
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'transfer-family-sftp-server'
      }]
      // workflowDetails: {
      //   onPartialUpload: [{
      //     executionRole: 'executionRole',
      //     workflowId: 'workflowId',
      //   }],
      //   onUpload: [{
      //     executionRole: 'executionRole',
      //     workflowId: 'workflowId',
      //   }],
      // },
    });

    const param = new ssm.StringParameter(this, 'StringParameter', {
      description: 'Transfer Family Server ID',
      parameterName: '/sbt/transfer/server/id',
      stringValue: cfnServer.attrServerId
    });
  }
}
