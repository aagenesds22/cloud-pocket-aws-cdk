import { Duration, Size, Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, AwsIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { ArnPrincipal, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class CloudPocketInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiGateway = new RestApi(this, 'data-bucket-api', {
      restApiName: `data-bucket-rest-api`,
      description: 'REST API for serving raw data files',
      policy: new PolicyDocument({
        statements: [new PolicyStatement({
          actions: [
            "s3:GetObject",
            "s3:ListBucket",
            "s3:ListAllMyBuckets"
          ],
          resources: ["arn:aws:s3:::*"]
      })],
      }),
      binaryMediaTypes: ['*/*'],
      minCompressionSize: Size.bytes(0),
    });

    const executionRole = new Role(this, 'S3CommunicationWithAPIGtw', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    executionRole.addToPolicy(new PolicyStatement({
        actions: [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:ListAllMyBuckets"
        ],
        resources: ["arn:aws:s3:::*"]
    }));

    const s3IntegrationListObjects = new AwsIntegration({
      service: 's3',
      integrationHttpMethod: 'GET',
      action: 'ListBucket',
      subdomain: 'test-mediahstf',
      options: {
        credentialsRole: executionRole,
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': 'integration.response.header.Content-Type',
            },
          },
        ],
        requestParameters: {
          'integration.request.querystring.prefix': 'method.request.querystring.prefix'
        },
      },
    });

    const fileTypeResource = apiGateway.root.addResource('{bucket}').addResource('{cognitoId}');

    fileTypeResource.addMethod('GET', s3IntegrationListObjects, {
      authorizationType: AuthorizationType.IAM,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
          },
        },
      ],
      requestParameters: {
        'method.request.path.bucket': true,
        'method.request.path.cognitoId': true,
        'method.request.header.Content-Type': true,
      },
    });

    const s3Integration = new AwsIntegration({
      service: 's3',
      integrationHttpMethod: 'GET',
      path: 'test-mediahstf/{key}',
      action: 'GetObject',
      options: {
        credentialsRole: executionRole,
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': 'integration.response.header.Content-Type',
            },
          },
        ],
        requestParameters: {
          'integration.request.querystring.prefix': 'method.request.querystring.prefix',
          'integration.request.path.key': 'method.request.path.key',
        },
      },
    });

    const objectKeyResource = fileTypeResource.addResource('{key}');

// add GET method for getting objects
    objectKeyResource
      .addMethod('GET', s3Integration, {
        authorizationType: AuthorizationType.IAM,
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': true,
            },
          },
        ],
        requestParameters: {
          'method.request.path.bucket': true,
          'method.request.path.cognitoId': true,
          'method.request.path.key': true,
          'method.request.header.Content-Type': true,
        },
      });
  }
}
