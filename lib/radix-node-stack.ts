import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

require('dotenv').config();

const config = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

export class RadixNodeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { ...props, ...config });

    const vpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true });

    const securityGroup = new ec2.SecurityGroup(
      this,
      'radixNodeSecurityGroup',
      {
        vpc,
        securityGroupName: 'radix-node-security-group',
        allowAllOutbound: true,
      }
    );

    const role = new iam.Role(this, 'radixNodeRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow ssh access'
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8080),
      'allow 8080 access'
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(30000),
      'allow gossip port'
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'allow https'
    );

    const machineImage = ec2.MachineImage.genericLinux({
      'eu-west-1': 'ami-08bac620dc84221eb',
    });

    const instance = new ec2.Instance(this, 'radixNodeEc2Instance', {
      instanceName: 'radixNode',
      keyName: process.env.SSH_KEY_NAME,
      role: role,
      vpc,
      securityGroup,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.C5,
        ec2.InstanceSize.XLARGE
      ),
      machineImage,
    });

    const ip = new ec2.CfnEIP(this, 'radixNodeIp');

    new ec2.CfnEIPAssociation(this, 'radixNodeIpAssociation', {
      eip: ip.ref,
      instanceId: instance.instanceId,
    });
  }
}
