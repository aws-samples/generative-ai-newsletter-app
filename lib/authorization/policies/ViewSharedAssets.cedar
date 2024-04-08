permit (
    principal,
    action in
        [GenAINewsletter::Action::"viewNewsletter",
         GenAINewsletter::Action::"viewDataFeed",
         GenAINewsletter::Action::"viewPublications",
         GenAINewsletter::Action::"viewArticles"],
    resource
)
when { resource.isPrivate == false };