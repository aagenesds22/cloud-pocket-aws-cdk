#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CloudPocketInfraStack } from '../lib/cloud-pocket-infra-stack';

const app = new cdk.App();
new CloudPocketInfraStack(app, 'CloudPocketInfraStack');
