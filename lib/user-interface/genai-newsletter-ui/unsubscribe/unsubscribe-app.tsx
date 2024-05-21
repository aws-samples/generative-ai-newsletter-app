/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Box, Button, Container, Grid, Header, StatusIndicator } from "@cloudscape-design/components";
import { AppConfig } from "../src/common/types";
import { useCallback, useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { useSearchParams } from "react-router-dom";
import { externalUnsubscribeFromNewsletter } from "../../../../lib/shared/api/graphql/mutations";
import { generateAuthorizedClient } from "../src/common/helpers";

export function UnsubscribeApp() {
	const [searchParams] = useSearchParams()
	const [config, setConfig] = useState<AppConfig | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)
	const [success, setSuccess] = useState(false)

	const unsubscribe = useCallback(async () => {
		setLoading(true)
		const newsletterId = searchParams.get('newsletterId')
		const userId = searchParams.get('userId')
		if (config !== null && newsletterId !== null && userId !== null) {
			const client = await generateAuthorizedClient()
			const success = await client.graphql({
				query: externalUnsubscribeFromNewsletter,
				variables: {
					input: {
						id: newsletterId,
						userId: userId
					}
				}
			})
			if (success) {
				setSuccess(true)
			} else {
				setError(true)
				setSuccess(false)
			}
		}
		setLoading(false)
	}, [config, searchParams])

	useEffect(() => {
		(async () => {
			try {
				const result = await fetch('/amplifyconfiguration.json')
				const awsExports = (await result.json()) as AppConfig | null
				Amplify.configure({
					...awsExports
				})
				if (awsExports !== null) {
					awsExports.apiClient = await generateAuthorizedClient()
				}
				setConfig(awsExports)
				console.debug('configuration loaded')
				const newsletterId = searchParams.get('newsletterId')
				const userId = searchParams.get('userId')
				if (newsletterId !== null && userId !== null) {
					console.log(newsletterId, userId)
					setLoading(false)
				} else {
					setError(true)
					console.error('missing newsletterId or userId', { newsletterId, userId })
				}
			} catch (e) {
				setError(true)
				console.error(e)
			}
		})()
	}, [searchParams])

	return (
		<Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
			<div></div>
			<Box textAlign="center" variant="div">
				<Container header={
					<Header variant="awsui-h1-sticky">Unsubscribe from Newsletter</Header>
				}>
					{loading ? <div>
						<StatusIndicator type="loading" >Loading, please wait</StatusIndicator>

					</div>
						:
						error ? <>
							<StatusIndicator type="error">There was an error unsubscribing from the newsletter</StatusIndicator>
						</> :
							<div>
								{
									!success ? <div>
										<p>Do you wish to proceed?</p>
										<Button onClick={unsubscribe}>Unsubscribe</Button>
									</div> : <div>
										<p>You have been unsubscribed from the newsletter</p>
									</div>
								}
							</div>}
				</Container>
			</Box>
			<div></div>
		</Grid>
	)
}

