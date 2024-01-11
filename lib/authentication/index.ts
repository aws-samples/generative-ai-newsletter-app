import { RemovalPolicy } from 'aws-cdk-lib'
import { IdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha'
import { UserPool } from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'

interface AuthenticationProps {
  userPoolId?: string
  userPoolClientId?: string
}

export class Authentication extends Construct {
  public readonly userPoolId: string
  public readonly userPoolClientId: string
  public readonly identityPoolId: string
  private readonly userPool: UserPool
  constructor (scope: Construct, id: string, props?: AuthenticationProps) {
    super(scope, id)

    if (props?.userPoolId === undefined) {
      const userPool = new UserPool(this, 'UserPool', {
        removalPolicy: RemovalPolicy.DESTROY,
        selfSignUpEnabled: true,
        signInAliases: {
          email: true
        }
      })
      this.userPoolId = userPool.userPoolId
      const userPoolClient = userPool.addClient('UserPoolClient', {
        generateSecret: false,
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
          userSrp: true
        }
      })

      const identityPool = new IdentityPool(this, 'IdentityPool', {
        authenticationProviders: {
          userPools: [
            new UserPoolAuthenticationProvider({
              userPool, userPoolClient
            })
          ]
        }
      })
      this.userPoolClientId = userPoolClient.userPoolClientId
      this.identityPoolId = identityPool.identityPoolId
    } else {
      const userPool = UserPool.fromUserPoolId(this, 'UserPool', props.userPoolId)
      this.userPoolId = userPool.userPoolId
    }
  }
}
