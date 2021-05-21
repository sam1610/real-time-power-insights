import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as RealTimePowerInsights from '../lib/real-time-power-insights-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new RealTimePowerInsights.RealTimePowerInsightsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
