
## Quick Rundown

START
- GET FEED DATA
- PARSE RSS FEED
- INSERT INTO S3 WITH HASH KEY
- S3 Object Notifications on CREATE (not update)
- Each crawls URL via lambda and put data in KB bbucket, and queue related crawling (fan out, but within restrictions)
- Bedrock KB syncs to bbucket
END INGEST

#### Useful Resources

Python
https://pypi.org/project/bs4/
https://github.com/flamingquaks/aws-genai-llm-chatbot/blob/main/lib/shared/layers/python-sdk/python/genai_core/websites/crawler.py


Node
https://www.npmjs.com/package/cheerio

PGVector & Titan Embedding
https://github.com/aws-samples/semantic-search-using-amazon-aurorapg-pgvector-and-amazon-bedrock/blob/main/Home.py

https://github.com/pgvector/pgvector#languages
https://github.com/pgvector/pgvector-node

https://aws.amazon.com/blogs/database/building-ai-powered-search-in-postgresql-using-amazon-sagemaker-and-pgvector/


### Some General Flow Stuff


Crawler Lambda:
    Scrapes New Site
    Writes Content to S3
    Puts RSS Data into DDB - DDB is primary store date relavency, id reverse look up to vector store
    Queues External Links in SQS

Crawler Lambda polls SQS for queued objects
    Scrapes websites
    Writes content to S3 under the articles content.
        Queues external links for SQS 
            Define a Max Depth (how many links of links removed from the original article)

    
