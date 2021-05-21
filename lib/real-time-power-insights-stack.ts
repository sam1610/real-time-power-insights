import * as cdk from '@aws-cdk/core';
import {IotToLambdaToDynamoDB, IotToLambdaToDynamoDBProps } from  '@aws-solutions-constructs/aws-iot-lambda-dynamodb';
import * as lambda  from "@aws-cdk/aws-lambda";
import { LambdaToDynamoDB} from "@aws-solutions-constructs/aws-lambda-dynamodb";
import { EventsRuleToLambda}  from "@aws-solutions-constructs/aws-events-rule-lambda";
import * as events from "@aws-cdk/aws-events";
import { inflate } from 'zlib';
import {LambdaToSns } from "@aws-solutions-constructs/aws-lambda-sns";
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

    new EventsRuleToLambda( this, "insights-function-scheduler", {
      existingLambdaObj: insightsFunction.lambdaFunction, 
      eventRuleProps: {
        schedule :events.Schedule.expression('rate(5 minutes')
      }


    })
    new LambdaToSns( this, "insights-notification-service", {
      existingLambdaObj: insightsFunction.lambdaFunction
    })

  }
}
