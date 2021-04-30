import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as RadixNode from '../lib/radix-node-stack';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new RadixNode.RadixNodeStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
