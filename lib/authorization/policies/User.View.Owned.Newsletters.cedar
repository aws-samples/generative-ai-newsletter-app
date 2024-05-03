permit (
    principal,
    action in
        [GenAINewsletter::Action::"getNewsletter",
         GenAINewsletter::Action::"listNewsletters",
         GenAINewsletter::Action::"listUserSubscriptions",
         GenAINewsletter::Action::"listPublications",
         GenAINewsletter::Action::"getPublication",
         GenAINewsletter::Action::"checkSubscriptionToNewsletter"],
    resource
)
when { resource.Account == principal.Account };