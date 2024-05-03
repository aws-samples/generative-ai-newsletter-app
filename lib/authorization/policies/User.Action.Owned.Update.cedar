permit (
    principal,
    action in
        [GenAINewsletter::Action::"updateNewsletter",
         GenAINewsletter::Action::"updateDataFeed"],
    resource
)
when { resource.Account == principal.Account };