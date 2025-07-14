import * as cdk from 'aws-cdk-lib';
import { aws_amplify as amplify } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface SbtAmplifyDomainStackProps extends cdk.StackProps {
  appId: string; // The Amplify App ID to associate with the domain
  domainName: string; // The custom domain name to be used
  branchName: string;
}
export class SbtAmplifyDomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SbtAmplifyDomainStackProps) {
    super(scope, id, props);

    const cfnDomain = new amplify.CfnDomain(this, 'MyCfnDomain', {
      appId: props.appId,
      domainName: props.domainName,
      subDomainSettings: [{
        branchName: props.branchName,
        prefix: 'prefix',
      }],

      // the properties below are optional
      // autoSubDomainCreationPatterns: ['autoSubDomainCreationPatterns'],
      // autoSubDomainIamRole: 'autoSubDomainIamRole',
      // certificateSettings: {
      //   certificateType: 'certificateType',
      //   customCertificateArn: 'customCertificateArn',
      // },
      enableAutoSubDomain: false,
    });
  }
}