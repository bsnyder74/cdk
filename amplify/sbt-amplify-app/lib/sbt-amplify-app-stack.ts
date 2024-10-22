import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { CfnDynamicReference } from "aws-cdk-lib";
import { Construct } from 'constructs';

export class SbtAmplifyAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Params and Lookups
    const service_role = ssm.StringParameter.valueFromLookup(this, '/sbt/iam/serviceroles/sbt-amplify-service-role/arn');
    // const access_token = new CfnDynamicReference(cdk.CfnDynamicReferenceService.SECRETS_MANAGER, 'sbt/github-fg/token:SecretString:token');
    const access_token = sm.Secret.fromSecretNameV2(this, 'sbt/github-fg/token', 'token');

    console.log(access_token);

    const amplify_app = new amplify.CfnApp(this, 'AmplifyApp', {
      name: 'cdk-test',
      accessToken: access_token.secretValue.unsafeUnwrap().toString(),
      customRules: [{
        source: '</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>',
        target: '/index.html',
        status: '200',
      }],
      iamServiceRole: service_role,
      platform: 'WEB',
      repository: 'https://github.com/bsnyder74/angular-realworld-example-app'
    });

    const amplify_branch = new amplify.CfnBranch(this, 'AmplifyBranch', {
      appId: amplify_app.attrAppId,
      branchName: 'main',
      enableAutoBuild: true
    });

    // Outputs
    new cdk.CfnOutput(this, 'AppId', {
      value: amplify_app.attrAppId
    });

  }
}
