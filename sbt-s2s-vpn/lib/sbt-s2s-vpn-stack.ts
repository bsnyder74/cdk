import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as r53resolver from 'aws-cdk-lib/aws-route53resolver';
import { Construct } from 'constructs';

export class SbtS2SVpnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Params and Lookups //
    const private_subnet_1_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/1/id');
    const private_subnet_2_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/private/subnet/2/id');
    const vpc_id = ssm.StringParameter.valueFromLookup(this, '/sbt/vpc/id');
    // L2 CDK Resources
    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      isDefault: false,
      vpcId: vpc_id
    });

    // Transit Gateway
    // Just for this testing code, normally this would already be provisioned
    const tgw = new ec2.CfnTransitGateway(this, 'TransitGateway', {
      amazonSideAsn: 64520,
      tags: [{
        key: 'Owner',
        value: 'brian'
      },
      {
        key: 'Name',
        value: 'tgw-1'
      }]
    });

    // Security Group for r53 resolvers
    const r53_resolver_sg = new ec2.SecurityGroup(this, 'R53ResolverSg', {
      vpc: vpc,
      securityGroupName: 'r53-resolver-sg'
    });

    // Cloudwatch Log Group for VPN
    const vpn_lg = new logs.LogGroup(this, 'Log Group', {
      logGroupName: 'vpn-lg',
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Customer Gateway
    const cgw = new ec2.CfnCustomerGateway(this, 'PrismaCustomerGateway', {
      bgpAsn: 65000,
      ipAddress: '68.10.39.177',
      type: 'ipsec.1',
      deviceName: 'PrismaBGP2-us-west-2',
      tags: [{
        key: 'Owner',
        value: 'brian'
      },
      {
        key: 'Name',
        value: 'PrismaBGP2-us-west-2'
      }]
    });

    // Site to site VPN
    const VPNConnection = new ec2.CfnVPNConnection(this, 'PrismaVPNConnection', {
      customerGatewayId: cgw.attrCustomerGatewayId,
      type: 'ipsec.1',
      transitGatewayId: tgw.attrId,
      tags: [{
        key: 'Owner',
        value: 'brian'
      },
      {
        key: 'Name',
        value: 'PrismaBGP2-us-west-2'
      }]
    });

    // Write VPN ID to parameter store
    const vpn_connection_id = new ssm.StringParameter(this, "VpnConnectionIdParam", {
      description: 'ID of VPN Connection',
      parameterName: '/sbt/vpc/vpn/1/id',
      stringValue: VPNConnection.attrVpnConnectionId
    });

    // Route 53 Resolvers
    const r53_in_resolver = new r53resolver.CfnResolverEndpoint(this, 'InboundResolver', {
      direction: 'INBOUND',
      ipAddresses: [
        { subnetId: private_subnet_1_id },
        { subnetId: private_subnet_2_id }
      ],
      securityGroupIds: [r53_resolver_sg.securityGroupId]
    });

    const r53_out_resolver = new r53resolver.CfnResolverEndpoint(this, 'OutboundResolver', {
      direction: 'OUTBOUND',
      ipAddresses: [
        { subnetId: private_subnet_1_id },
        { subnetId: private_subnet_2_id }
      ],
      securityGroupIds: [r53_resolver_sg.securityGroupId]
    });

    // Route 53 Resolver Rules
    const outbound_rule = new r53resolver.CfnResolverRule(this, 'OutboundRule', {
      domainName: 'corp.sbt.com',
      ruleType: 'FORWARD',
      name: 'OutboundDNSResolverRule',
      resolverEndpointId: r53_out_resolver.attrResolverEndpointId,
      targetIps: [
        {
          ip: '192.168.10.10',
          port: '53'
        },
        {
          ip: '192.168.10.11',
          port: '53'
        }
      ]
    });
  }
}
