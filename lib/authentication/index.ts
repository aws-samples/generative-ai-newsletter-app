import { Stack, type StackProps } from 'aws-cdk-lib'
import { UserPool } from 'aws-cdk-lib/aws-cognito'

interface AuthenticationStackProps extends StackProps {
  userPoolId?: string
}

export class AuthenticationStack extends Stack {
  public readonly userPool: UserPool
  constructor (scope: Stack, id: string, props?: AuthenticationStackProps) {
    super(scope, id, props)

    if (props?.userPoolId === undefined) {
      const userPool = new UserPool(this, 'UserPool', {
        selfSignUpEnabled: true
      })

      this.userPool = userPool
    } else {
      const userPool = UserPool.fromUserPoolId(this, 'UserPool', props.userPoolId)
      this.userPool = userPool as UserPool
    }
  }
}
