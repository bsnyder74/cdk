import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface SbtAmplifyAppStackProps extends cdk.StackProps {
  appName: string;
  repoUrl: string;
  branchName: string;
  autoBuild: boolean;
  owner: string;
  costCenter: string;
  githubTokenSecretName: string;
}
export class SbtAmplifyAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SbtAmplifyAppStackProps) {
    super(scope, id, props);

    // Params and Lookups
    const serviceRole = ssm.StringParameter.valueFromLookup(this, '/sbt/iam/serviceroles/sbt-amplify-service-role/arn');
    const accessToken = cdk.Fn.sub("{{resolve:secretsmanager:${SecretName}:SecretString:token}}", {
      SecretName: props.githubTokenSecretName || 'sbt/github-fg/token',
    });

    const buildSpec = `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*`;

    const amplify_app = new amplify.CfnApp(this, 'AmplifyApp', {
      name: props.appName,
      repository: props.repoUrl,
      platform: 'WEB',
      accessToken,
      iamServiceRole: serviceRole,
      enableBranchAutoDeletion: false,
      customRules: [{
        source: '/<*>',
        target: '/index.html',
        status: '404-200',
      }],
      buildSpec
    });

    const amplifyBranch = new amplify.CfnBranch(this, 'AmplifyBranch', {
      appId: amplify_app.attrAppId,
      branchName: props.branchName,
      enableAutoBuild: props.autoBuild
    });

    // Outputs
    new cdk.CfnOutput(this, 'AppId', {
      value: amplify_app.attrAppId
    });

    new cdk.CfnOutput(this, 'AppBranch', {
      value: amplifyBranch.attrBranchName
    });
  }
}
