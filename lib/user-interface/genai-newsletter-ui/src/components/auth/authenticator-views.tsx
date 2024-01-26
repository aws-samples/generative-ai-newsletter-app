import { Alert, Box, Button, Container, Form, FormField, Header, Input, SpaceBetween } from '@cloudscape-design/components';
import { confirmSignIn, getCurrentUser, signIn, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { useCallback, useContext, useState } from 'react';
import { AppContext } from '../../common/app-context';

export function DefaultAuthenticator() {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [authStep, setAuthStep] = useState<'LOGIN' | 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'>('LOGIN')
    const [newPasswordOne, setNewPasswordOne] = useState<string>('')
    const [newPasswordTwo, setNewPasswordTwo] = useState<string>('')

    const handleSignIn = useCallback(
        async () => {
            try {
                await getCurrentUser()
                await signOut()
                console.log('triggered sign out')
            } catch (error) {
                console.log('looks like no active user!')
                console.log(error)
            }
            console.log('starting handleSignIn logic')
            try {
                const signInResponse = await signIn({ username, password });
                if (!signInResponse.isSignedIn && signInResponse.nextStep.signInStep == 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
                    setAuthStep('CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED')
                    setLoading(false)
                }
            } catch (error) {
                console.log(error)
                setMessage("There was an error signing you in. " +
                    "Please confirm your username & password are correct and try again.")
                setError(true)
                setLoading(false)
            }
        }, [password, username])

    const handleSubmit = useCallback(() => {
        console.debug('handle sign in')
        if (username.length > 0 && password.length > 0) {
            setLoading(true)
            handleSignIn()
        } else {
            console.log('no username or password')
        }
    }, [handleSignIn, password, username])

    const handleConfirmSignIn = useCallback(
        async () => {
            if (newPasswordOne.length > 0 && newPasswordTwo.length > 0) {
                if (newPasswordOne === newPasswordTwo) {
                    setLoading(true)
                    const response = await confirmSignIn({
                        challengeResponse: newPasswordOne
                    })
                    console.debug(response)
                } else {
                    setMessage("The passwords you entered do not match.")
                    setError(true)
                    setLoading(false)
                }
            }
        }, [newPasswordOne, newPasswordTwo])

    return (
        <Box display='block' margin={'l'} padding={'n'}>
            <SpaceBetween direction='vertical' size='l' alignItems='center'>
                {authStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' ?
                    <Container
                        header={
                            <Header
                                variant="h2"
                                description="Please set a new password"
                            >Set Password & Sign In</Header>
                        }
                    >
                        {error ? <Alert
                            type='error'
                            dismissible
                            onDismiss={() => setError(false)}>{message}</Alert> : null}
                        <form onSubmit={(e) => { e.preventDefault(); handleConfirmSignIn() }}>
                            <Form
                                actions={
                                    <Button loading={loading} variant='primary'>Update Password & Sign In</Button>
                                }
                            >
                                <FormField label="New Password">
                                    <Input value={newPasswordOne} type='password' onChange={e => setNewPasswordOne(e.detail.value)} />
                                </FormField>
                                <FormField label="Confirm New Password">
                                    <Input value={newPasswordTwo} type='password' onChange={e => setNewPasswordTwo(e.detail.value)} />
                                </FormField>
                            </Form>
                        </form>

                    </Container> :
                    <Container
                        header={
                            <Header
                                variant="h2"
                                description="Sign in to your account"
                            >Sign In

                            </Header>
                        }
                    >
                        {error ? <Alert
                            type='error'
                            dismissible
                            onDismiss={() => setError(false)}>{message}</Alert> : null}
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                            <Form actions={
                                <Button loading={loading} variant='primary'>Sign In</Button>
                            }
                            >
                                <FormField label="Username">
                                    <Input ariaRequired autoFocus value={username} onChange={e => setUsername(e.detail.value)} />
                                </FormField>
                                <FormField label="Password">
                                    <Input ariaRequired type="password" value={password} onChange={e => setPassword(e.detail.value)} />
                                </FormField>
                            </Form>

                        </form>
                    </Container>
                }
            </SpaceBetween>
        </Box>

    )

}

export function CustomAuthenticator() {
    const appContext = useContext(AppContext)

    const handleFederateClick = () => {
        console.log('handleFederateFlickStart')
        let provider = null
        if (!appContext) { return }
        console.log(appContext)
        if (!appContext.Auth.Cognito.loginWith?.oauth) { return }
        if (appContext.Auth.Cognito.loginWith?.oauth?.providers !== undefined) {
            console.log('providers present')
            for (const listedProvider of appContext.Auth.Cognito.loginWith.oauth.providers) {
                if (listedProvider instanceof Object && listedProvider.custom !== undefined) {
                    provider = listedProvider
                }
            }
            console.log(provider)

            signInWithRedirect({
                provider: {
                    custom: 'AmazonFederate'
                }
            })


        }
    }



    return (
        <SpaceBetween direction='vertical' size='l' alignItems='center'>
            <Container
                header={
                    <Header
                        description="Click to Federate">
                        Sign In
                    </Header>
                }
            >
                <Button variant='primary' onClick={handleFederateClick}>
                    Federate
                </Button>
            </Container>
        </SpaceBetween>
    )
}