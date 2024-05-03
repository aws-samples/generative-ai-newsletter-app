permit (
    principal,
    action in GenAINewsletter::Action::"getNewsletter",
    resource
)
when { resource.isPrivate == false };