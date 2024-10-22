import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Pipeline,
  Artifact
} from 'aws-cdk-lib/aws-codepipeline';
import {
  CodeBuildAction,
  CodeStarConnectionsSourceAction,
  GitHubSourceAction,
  GitHubTrigger
} from 'aws-cdk-lib/aws-codepipeline-actions';
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';

export class SbtCodepipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceOutput = new Artifact();

    const test_project = new PipelineProject(this, 'PipelineProject', {
      // Add a descriptive projectName , this is used for Cloudwatch log group name
      projectName: 'Build-Project',
      environment: {
        buildImage: LinuxBuildImage.fromCodeBuildImageId('aws/codebuild/standard:6.0')
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.1',
        phases: {
          build: {
            'on-failure': 'ABORT',
            commands: ['echo Hello World']
          }
        }
      })
    });

    const pipeline = new Pipeline(this, "TestPipeline", {
      // crossAccountKeys: true,
      pipelineName: 'test-pipeline'
    });

    // const secretToken = cdk.SecretValue.secretsManager('sbt/github-fg/token', { jsonField: 'token' });
    // console.log(secretToken);

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodeStarConnectionsSourceAction({
          actionName: 'GitHubSource',
          branch: 'main',
          connectionArn: 'arn:aws:codestar-connections:us-west-2:540796455178:connection/23c5ed3d-5e83-40b5-8eb9-c46454f5f9e1',
          owner: 'bsnyder74',
          repo: 'oidc-test',
          output: sourceOutput
        })
      ]
      // actions: [
      //   new GitHubSourceAction({
      //     actionName: 'Source',
      //     owner: 'bsnyder74',
      //     repo: 'oidc-test',
      //     branch: 'main',
      //     oauthToken: secretToken,
      //     output: sourceOutput,
      //     trigger: GitHubTrigger.WEBHOOK
      //   }),
      // ],
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodeBuildAction({
          actionName: 'Build',
          project: test_project,
          input: sourceOutput,
          outputs: undefined
        })
      ]
    });

  }
}
