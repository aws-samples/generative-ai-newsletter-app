import { RemovalPolicy } from 'aws-cdk-lib'
import { type IIdentityPool, IdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha'
import { type IUserPool, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'
import { Role, type IRole } from 'aws-cdk-lib/aws-iam'

interface AuthenticationProps {
  userPoolId?: string
  userPoolClientId?: string
}

export class Authentication extends Construct {
  public readonly userPoolId: string
  public readonly userPoolClientId: string
  public readonly userPool: IUserPool
  public readonly identityPool: IIdentityPool
  public readonly authenticatedUserRole: IRole
  constructor (scope: Construct, id: string, props?: AuthenticationProps) {
    super(scope, id)
    const auth = this.node.tryGetContext('authConfig')
    if (props?.userPoolId === undefined && auth === undefined) {
      const selfSignUpEnabled = this.node.tryGetContext('selfSignUpEnabled') ?? false
      const userPool = new UserPool(this, 'UserPool', {
        removalPolicy: RemovalPolicy.DESTROY,
        selfSignUpEnabled,
        signInAliases: {
          email: true
        },
        standardAttributes: {
          email: {
            required: true
          },
          givenName: {
            required: true,
            mutable: true
          },
          familyName: {
            required: true,
            mutable: true
          }
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
      this.userPool = userPool
      this.userPoolClientId = userPoolClient.userPoolClientId
      this.identityPool = identityPool
    } else {
      const userPool = UserPool.fromUserPoolId(this, 'UserPool', props?.userPoolId ?? auth.cognito.userPoolId as string)
      if ((props?.userPoolClientId === undefined) && auth.cognito.userPoolClientId === undefined) {
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
        this.identityPool = identityPool
      } else {
        this.userPoolClientId = props?.userPoolClientId ?? auth.cognito.userPoolClientId
        if (auth.cognito.identityPoolId !== undefined && auth.cognito.authenticatedUserArn !== undefined) {
          this.identityPool = IdentityPool.fromIdentityPoolId(this, 'IdentityPool', auth.cognito.identityPoolId as string)
          this.authenticatedUserRole = Role.fromRoleArn(this, 'AuthenticatedUserRole', auth.cognito.authenticatedUserArn as string, {
            mutable: true
          })
        } else {
          const identityPool = new IdentityPool(this, 'IdentityPool', {
            authenticationProviders: {
              userPools: [
                new UserPoolAuthenticationProvider({
                  userPool, userPoolClient: UserPoolClient.fromUserPoolClientId(this, 'UserPoolClient', this.userPoolClientId)
                })
              ]
            }
          })
          this.identityPool = identityPool
          this.authenticatedUserRole = identityPool.authenticatedRole as Role
        }
      }
      this.userPoolId = userPool.userPoolId
      this.userPool = userPool
      if (this.authenticatedUserRole === undefined) {
        throw new Error('DAMN')
      }
    }
  }
}
