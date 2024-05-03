permit (
    principal,
    action in
        [GenAINewsletter::Action::"getDataFeed",
         GenAINewsletter::Action::"listDataFeeds",
         GenAINewsletter::Action::"getArticle",
         GenAINewsletter::Action::"listArticles"],
    resource
)
when { resource.Account == principal.Account };