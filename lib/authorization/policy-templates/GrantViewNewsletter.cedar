permit (
    principal == ?principal,
    action in [GenAINewsletterApp::Action::"viewNewsletter"],
    resource == ?resource
);