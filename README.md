# webhook-service
Basic design for a webhook service. Example illustrated by subscribing to Hackernews home page changes.

# Goal

Allow users to subscribe to HackerNews updates through webhook events:

- HackerNews.news.updated
- HackerNews.userSubmissions.updated

# Design

Current:

![webhook-Page-1 drawio](https://user-images.githubusercontent.com/16827269/183570274-3a5b6e2b-ff9f-4c73-8eac-9cd092ccebd2.png)

Ideal:

![webhook-Page-2 drawio](https://user-images.githubusercontent.com/16827269/183570282-7c582656-4e4f-4457-ad6f-450d9f808832.png)


# Tables

### subscriptions

- id
- application_id
- event_type
    - HackerNews.news.updated
    - HackerNews.userSubmissions.updated
- uri
- created_at
- updated_at
- active (boolean)
- metadata (JSON), stores metadata like username

### event_delivery_logs

- id
- event_type
- subscription_id
- created_at
- payload (list of new submissions)

### subscription_status

- subscription_id
- status_code
- message

### event_logs (TODO, for event delivery logging)

- id
- event_id
- retries
- updated_at
- status

### snapshots (TODO, for persisting webpage/data states)

- 

## Services

### subscription

Contains all developer-facing endpoints including PATCH, DELETE and get webhooks

### update

A cron job(?) that runs HN scrappers periodically with duration configured by command line. Fire POST requests to subscriptions (sync) or fire events to message queue(async)

### eventing(TODO)

Subscribes to event message queue and POST events to subscribed URIs. Record failed deliveries and handle retries with exponential back-off
