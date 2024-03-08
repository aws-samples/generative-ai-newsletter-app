permit (
	principal == ?principal,
	action in [GenAINewsletterApp::Action::"viewDataFeed"],
	resource == ?resource
);