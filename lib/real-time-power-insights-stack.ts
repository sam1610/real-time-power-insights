import * as cdk from '@aws-cdk/core';
import {IotToLambdaToDynamoDB, IotToLambdaToDynamoDBProps } from  '@aws-solutions-constructs/aws-iot-lambda-dynamodb';
import * as lambda  from "@aws-cdk/aws-lambda";
import { LambdaToDynamoDB} from "@aws-solutions-constructs/aws-lambda-dynamodb";

import * as path from 'path';

export class RealTimePowerInsightsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const iotLambdaDdb= new IotToLambdaToDynamoDB( this, "data-processing",{
      lambdaFunctionProps:{
        code:lambda.Code.fromAsset(path.join(__dirname, 'lambda/processing')),
        runtime:lambda.Runtime.NODEJS_12_X, 
        handler: 'index.handler'
      },
      iotTopicRuleProps:{
        topicRulePayload:{
          ruleDisabled:false,
          description: 'Topic for ingesting and filtering real time data',
          sql: "SELECT * FROM 'general/#'",
          actions:[]
        }
      }
    })
    const insightsFunction= new LambdaToDynamoDB( this, 'insights-function', {
      lambdaFunctionProps:{
        code:lambda.Code.fromAsset(path.join(__dirname, 'lambda/insights')),
        runtime: lambda.Runtime.NODEJS_12_X, 
        handler: 'index.handler'
      }, 
      existingTableObj: iotLambdaDdb.dynamoTable
    })




  }
}
