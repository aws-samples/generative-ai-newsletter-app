permit (
    principal,
    action in GenAINewsletter::Action::"getDataFeed",
    resource
)
when { resource.isPrivate == false };