import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { aws_transfer as transfer } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
const yaml = require('js-yaml');

export class AwsTransferFamilyServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Params and Lookups //
    const private_subnet_1_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/1/id');
    const private_subnet_2_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/2/id');
    const private_subnet_3_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/3/id');
    const vpc_id = ssm.StringParameter.valueForStringParameter(this, '/sbt/vpc/id');
    const transfer_server_customer_pl_1 = ssm.StringParameter.valueForStringParameter(this, '/sbt/vpc/prefixlist/transferserver/01/id');


    const transfer_server_role = new iam.Role(this, 'TransferFamilyLoggingRole', {
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSTransferLoggingAccess')
      ],
      assumedBy: new iam.ServicePrincipal('transfer.amazonaws.com')
    });

    const transfer_server_sg1 = new ec2.CfnSecurityGroup(this, 'TransferServerSg1', {
      groupDescription: 'Customer access to Transfer Server 1 secuity group 1',
      groupName: 'transfer-server-sg-1',
      securityGroupIngress: [{
        ipProtocol: 'tcp',
        fromPort: 22,
        toPort: 22,
        sourcePrefixListId: transfer_server_customer_pl_1
      }],
      vpcId: vpc_id,
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'transfer-server-1-sg-1'
      }]
    });

    const eip1 = new ec2.CfnEIP(this, 'TransferServerEIP1', {
      domain: 'vpc',
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'transfer-server-1-eip-1'
      }]
    });

    const eip2 = new ec2.CfnEIP(this, 'TransferServerEIP2', {
      domain: 'vpc',
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'transfer-server-1-eip-2'
      }]
    });

    const eip3 = new ec2.CfnEIP(this, 'TransferServerEIP3', {
      domain: 'vpc',
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'transfer-server-1-eip-3'
      }]
    });

    const transfer_server = new transfer.CfnServer(this, 'TransferServer', {
      domain: 'S3',
      endpointDetails: {
        addressAllocationIds: [eip1.attrAllocationId, eip2.attrAllocationId, eip3.attrAllocationId],
        securityGroupIds: [transfer_server_sg1.attrGroupId],
        subnetIds: [private_subnet_1_id, private_subnet_2_id, private_subnet_3_id],
        vpcId: vpc_id
      },
      endpointType: 'VPC',
      identityProviderType: 'SERVICE_MANAGED',
      loggingRole: transfer_server_role.roleArn,
      preAuthenticationLoginBanner: 'This system is for the use of authorized users only. Individuals using this computer system without authority, or in excess of their authority, are subject to having all of their activities on this system monitored and recorded by system personnel.',
      protocols: ['SFTP'],
      securityPolicyName: 'TransferSecurityPolicy-2022-03',
      tags: [{
        key: 'Owner',
        value: 'brian'
      }, {
        key: 'Name',
        value: 'transfer-server-01'
      }, {
        key: 'transfer:route53HostedZoneId',
        value: '/hostedzone/Z00472681NDTPZE6NHIBE'
      }, {
        key: 'transfer:customHostname',
        value: 'sftp.squarebtech.com'
      }]
    });

    const transfer_server_id = new ssm.StringParameter(this, 'TransferServerId', {
      description: 'Transfer Family Server 01 ID',
      parameterName: '/sbt/transferserver/01/id',
      stringValue: transfer_server.attrServerId
    });

    // const env = this.node.tryGetContext('dev');
    // const b_name = env.get("bucket_name");
    // console.log(env["bucket_name"]);
    // console.log(vars);
    //console.log(vars["bucket_name"]);
    let env = this.node.tryGetContext('config');
    const vars = yaml.load(fs.readFileSync(path.resolve("./config/" + env + ".yaml"), "utf-8"));

    const sftp_bucket = new s3.Bucket(this, 'Bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      bucketName: vars["bucket_name"]
    });

    const sftp_s3_role = new iam.Role(this, 'SftpS3Role', {
      assumedBy: new iam.ServicePrincipal('transfer.amazonaws.com'),
      roleName: 'SftpS3Role'
    });

    const sftp_s3_policy_document = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: [
            's3:ListBucket',
          ],
          resources: [sftp_bucket.bucketArn],
        }),
        new iam.PolicyStatement({
          actions: [
            "s3:PutObject",
            "s3:GetObject",
            "s3:DeleteObjectVersion",
            "s3:DeleteObject",
            "s3:GetObjectVersion",
            "s3:GetObjectACL",
            "s3:PutObjectACL"
          ],
          resources: [sftp_bucket.arnForObjects('*')],
        }),
      ]
    });

    new iam.Policy(this, 'SftpS3Policy', {
      document: sftp_s3_policy_document,
      roles: [sftp_s3_role],
      policyName: 'SftpS3Access'
    });
  }
}
