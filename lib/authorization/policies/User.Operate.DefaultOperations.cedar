permit (
    principal,
    action == GenAINewsletter::Action::"graphqlOperation",
    resource
)
when
{
    resource in [GenAINewsletter::Operation::"createNewsletter",
     GenAINewsletter::Operation::"getNewsletter",
     GenAINewsletter::Operation::"listNewsletters",
     GenAINewsletter::Operation::"createDataFeed",
     GenAINewsletter::Operation::"getDataFeed",
     GenAINewsletter::Operation::"listDataFeeds",
     GenAINewsletter::Operation::"listArticles",
     GenAINewsletter::Operation::"getPublication",
     GenAINewsletter::Operation::"listPublications",
     GenAINewsletter::Operation::"listUserSubscriptions",
     GenAINewsletter::Operation::"checkSubscriptionToNewsletter",
     GenAINewsletter::Operation::"subscribeToNewsletter",
     GenAINewsletter::Operation::"unsubscribeFromNewsletter",
     GenAINewsletter::Operation::"updateNewsletter",
     GenAINewsletter::Operation::"updateDataFeed",
     GenAINewsletter::Operation::"canUpdateDataFeed",
     GenAINewsletter::Operation::"canUpdateNewsletter",
     GenAINewsletter::Operation::"getNewsletterSubscriberStats"]
};