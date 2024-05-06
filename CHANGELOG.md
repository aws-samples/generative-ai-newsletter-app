## **1.1.0**&emsp;<sub><sup>2024-05-03 (e5df8e26837978750802d21ec4cbc2f04d45b800...88195107222c9e8b90e8c9a545f95fdcc36b73f9)</sup></sub>

### Bug Fixes

- typos in text and code chore: enable cedar extensions (7ee3b5ed46eec43909cab4af79fa18c7a1867cc0)
- fixed cedarschema name change bug in cdk (1c23cb7ef0fef5bd432c081dd02035440f946efe)
- fixed bug on newsletter generator expecting a provided hostname (449543a6497d63d9fdb454abe5075afefd68e560)
- Improve In\-App View of Newsletter (66cc1ae67b677b4618a3339c362718d65d577726)

### Merges

- pull request \#2 from aws\-samples/dependabot (8229c14adeec3cc0223f3c18c6cf18f3eb6222f4)


### BREAKING CHANGES
- `auth` The refactor can potentially cause down time during deployment\. If the deployment (627230f2cd60502f69b5c219af4166ddf3320801)

fails, temporarily comment out the resolvers in CDK, deploy, then add the resolvers back and deploy
  again
<br>

## **1.0.0**&emsp;<sub><sup>2024-04-04 (2fa39380d025729852d5d2708675d8b1bf674a74...4313411db83166666926d23275bd6fa810c9699f)</sup></sub>

### Bug Fixes

- fixed bug with CfnOutputs not able to exist in more than one stack (a1ece298e883de02c1dfe07b8e0b70d7abe701b5)

### Merges

- pull request \#1 from aws\-samples/workflow\-updates (4313411db83166666926d23275bd6fa810c9699f)

<br>

## **0.9.2**&emsp;<sub><sup>2024-04-03 (2fa39380d025729852d5d2708675d8b1bf674a74...a8bd1237094005a739aa6606e43ddc55d967c7ef)</sup></sub>

### Bug Fixes

- fixed bug with CfnOutputs not able to exist in more than one stack (a1ece298e883de02c1dfe07b8e0b70d7abe701b5)

<br>

## **0.9.1**&emsp;<sub><sup>2024-04-02 (3af5423d788c6342a18cc8fc9bf932957375b026...1db6fe221cf8c6deb9d218b6cecf58f4313af424)</sup></sub>

### Bug Fixes

##### &ensp;`authentication`

- fixed post\-auth hook that was attempting to update claims unsuccessfully (cc33fa2799ffd56324ba9dd28a89261029f26da6)

### Merges

- remote\-tracking branch 'origin/main' into 43\-bug\-auth\-hook\-claims\-update\-error (8e5012a20d1f3f3317fa02d03c735b6dfafadd8d)

<br>

## **0.9.0**&emsp;<sub><sup>2024-04-01 (ab705cf5f9bd727cb56b9ebcdf199f30d6e01bb9...ab705cf5f9bd727cb56b9ebcdf199f30d6e01bb9)</sup></sub>

### Features

##### &ensp;`newsletter email`

- unsubscribe from email footer (ab705cf5f9bd727cb56b9ebcdf199f30d6e01bb9)

<br>

## **0.8.1**&emsp;<sub><sup>2024-03-29 (64dda49aaa846e0bc7fabac4692541589ffb321e...586d9d988846a52ffb12bba39cfe6d6af4dc0629)</sup></sub>

### Bug Fixes

##### &ensp;`authentication`

- new users failed to login because the PreToken Lambda failed (64dda49aaa846e0bc7fabac4692541589ffb321e)
- new users failed to login because the PreToken Lambda failed (586d9d988846a52ffb12bba39cfe6d6af4dc0629)

<br>

## **0.8.0**&emsp;<sub><sup>2024-03-28 (a242431babf4117efb23add5ef016fc86726fc5f...a36914b5ccb6e7d7df0ce370618683d3168fc840)</sup></sub>

### Features

##### &ensp;`user interface`

- added favicon & added AWS Icon to Global Header (a242431babf4117efb23add5ef016fc86726fc5f)
- added Dark Theme option \- Users can toggle between light and dark (a36914b5ccb6e7d7df0ce370618683d3168fc840)

<br>

## **0.7.0**&emsp;<sub><sup>2024-03-28 (7d813299b8f6451f8e34b97351eb8f046f1cdc93...72f7c2d8af920cff48ba8222c0224fab66a0e5cc)</sup></sub>

### Features

##### &ensp;`data feeds`

- rSS/ATOM feed ingest will handle page redirect to article (85101eeed252578b523756401e12491de0d48e89)

##### &ensp;`user interface`

- updated Landing Page content (72f7c2d8af920cff48ba8222c0224fab66a0e5cc)

### Bug Fixes

##### &ensp;`cli`

- hotfix for cli (7d813299b8f6451f8e34b97351eb8f046f1cdc93)

##### &ensp;`graphql api`

- fixed AppSync Data Source permissions to access Data Feed table index (329b2d1473f48f6a23da36f9d418085f3f83d8ea)

<br>

## **0.6.0**&emsp;<sub><sup>2024-03-27 (ba3a6026bc63e1240c75fbe68acbc81dab5e65d6...ed4419c6bf98b0836d07f1cde2f57c2fecabc648)</sup></sub>

### Features

##### &ensp;`user interface`

- deploy config CLI allows for custom hostname and ACM Cert now (ed4419c6bf98b0836d07f1cde2f57c2fecabc648)

### Bug Fixes

- fixed CDK NAG bug for CloudFront (4a2caab8283ff9c03d029160ffb1f77aae093a1b)

##### &ensp;`newsletter`

- fixed missing App Host Name on Email Generator lambda, causing missing flag links (3de4a05acb17d63319eea6375af1d1202e4c2632)

##### &ensp;`newsletters`

- users received "Access Denied" when attempting to view a newsletter publication (ba3a6026bc63e1240c75fbe68acbc81dab5e65d6)

##### &ensp;`ui`

- second fix for email preview access denied from S3 (60fc9dd5894359dc5cd24a1a415359e9b11d0880)
- added Loading view when page is doing full load rather than show login view (e34c9fb5a1878fbca28c4edcc6fc8b2f03516095)

##### &ensp;`user interface`

- fixed permission issue with CloudFront access UI Bucket (c2efa5cc49b4f218d1f7e88ee3f0a2b5ee0c23aa)


### BREAKING CHANGES
- `user interface` Previously, if a hostname/cert were set in console, they would remain unchanged\. (ed4419c6bf98b0836d07f1cde2f57c2fecabc648)

With this change, each deployment will set the hostname and acm cert \(or unset\) based on the config
  file\.
  
  re \#38
<br>

## **0.5.1**&emsp;<sub><sup>2024-03-20 (ba3a6026bc63e1240c75fbe68acbc81dab5e65d6...143cbafd4aed5151e0981003ef557da9a1a3d483)</sup></sub>

### Bug Fixes

##### &ensp;`newsletter`

- fixed missing App Host Name on Email Generator lambda, causing missing flag links (3de4a05acb17d63319eea6375af1d1202e4c2632)

##### &ensp;`newsletters`

- users received "Access Denied" when attempting to view a newsletter publication (ba3a6026bc63e1240c75fbe68acbc81dab5e65d6)

##### &ensp;`ui`

- second fix for email preview access denied from S3 (60fc9dd5894359dc5cd24a1a415359e9b11d0880)
- added Loading view when page is doing full load rather than show login view (e34c9fb5a1878fbca28c4edcc6fc8b2f03516095)

<br>

## **0.5.0**&emsp;<sub><sup>2024-03-08 (d78abfd8db9d69eb15042226a6c9910b9dfabbea...b52749ad5400be50807d9d9a077e033c40f874bd)</sup></sub>

### Features

##### &ensp;`genai`

- upgraded article ingestor & newsletter summary to Claude v3\-sonnet (29f4246566abdc307d25b42860325548354e3adb)

### Bug Fixes

- updated Step Functions to replace 'parameters' with 'itemSelector' (53ea224c7ce6b47a55550f7fb584b72b5afd0332)

##### &ensp;`email-generator`

- fixed email\-generator lambda missing APP\_HOST\_NAME (a151f896e4ce1aabd4b5a12971ef0f2ff1cbf93f)

##### &ensp;`ui`

- fixed missing preview on newsletter creation (b52749ad5400be50807d9d9a077e033c40f874bd)

<br>

## **0.4.1**&emsp;<sub><sup>2024-03-08 (46e7719e1246c19b58932515e2af821af783a3de...46e7719e1246c19b58932515e2af821af783a3de)</sup></sub>

### Bug Fixes

##### &ensp;`graphql-api`

- fixed getAccountIdForUser resolver declaration case \- was breaking build (46e7719e1246c19b58932515e2af821af783a3de)

<br>

## **0.4.0**&emsp;<sub><sup>2024-03-08 (dc67805c1b331e3a80bab91dc28b31621a1b01fe...245d9bdcf9da381f11b2e660beb509405757d40f)</sup></sub>

### Features

- \(security\): "Integrated Amazon Verified Permissions to manage user access permissions via GraphQL API \(appsync\)" (245d9bdcf9da381f11b2e660beb509405757d40f)

<br>

## **0.3.1**&emsp;<sub><sup>2024-02-13 (b0ae277d89d3da79717c07eecb75184ffe293c30...fd31626d95bc93bb95f7edd38d2fcf58569e4779)</sup></sub>

*no relevant changes*
<br>

## **0.3.0**&emsp;<sub><sup>2024-02-12 (436940be53c5212c6798bf0d4fefa60ea379344c...655c7499b7b0b08297cc4cec2384d29d0fa62ef5)</sup></sub>

### Features

##### &ensp;`user-interface`

- added Data Feed and Newsletter Table Filters (436940be53c5212c6798bf0d4fefa60ea379344c)

### Bug Fixes

##### &ensp;`newsletter-style`

- fixed preview functionality for Newsletter Styler (17ddb980efda1fb09c85f1cc6f7ede010c4ac6f8)

##### &ensp;`release`

- fixed release versioning script (655c7499b7b0b08297cc4cec2384d29d0fa62ef5)

<br>

## **0.2.0**&emsp;<sub><sup>2024-02-09 (232a37a4d2a0ea4986d0d0426069c1163a155c43...de04b957736b84fd50542518fd18ba49b2e5062d)</sup></sub>

### Features

##### &ensp;`user-interface`

- "Data Feed Details: Sort Articles by Date" (a0ec94a7076f369739946a3f1e74d04f889174e7)
- "Newsletter: Style Editor/Builder" (9fef400a92ab919bb5f64dab0b302925aa8b9d49)

### Bug Fixes

##### &ensp;`user-interface`

- first sign\-in user attributes fixed (372c202fda082c803cd2a809b3a4a0ab5a7c6b2f)

### Merges

- branch '14\-refactor\-appsync\-javascript\-resolvers\-to\-typescript' into 'main' (89bd484cedc4880d5671f5950f375e353e19f8c2)

<br>

## **0.1.1**&emsp;<sub><sup>2024-02-05 (232a37a4d2a0ea4986d0d0426069c1163a155c43...0f662f7ff3da43ddd867cdfcd0891bd7565ed96a)</sup></sub>

### Bug Fixes

##### &ensp;`user-interface`

- first sign\-in user attributes fixed (372c202fda082c803cd2a809b3a4a0ab5a7c6b2f)

### Merges

- branch '14\-refactor\-appsync\-javascript\-resolvers\-to\-typescript' into 'main' (89bd484cedc4880d5671f5950f375e353e19f8c2)

<br>

