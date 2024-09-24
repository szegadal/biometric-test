import { defineBackend } from '@aws-amplify/backend'
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { auth } from './auth/resource'

const backend = defineBackend({
  auth
})

const livenessStack = backend.createStack('liveness-stack')

const livenessPolicy = new Policy(livenessStack, 'LivenessPolicy', {
  statements: [
    new PolicyStatement({
      actions: ['rekognition:StartFaceLivenessSession'],
      resources: ['*']
    })
  ]
})
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(livenessPolicy) // allows guest user access
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(livenessPolicy) // allows logged in user access
