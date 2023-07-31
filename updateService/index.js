const nodeCron = require("node-cron");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const Subscription = require('./models/Subscription.js');
const SubscriptionStatus = require('./models/SubscriptionStatus.js');
const Event = require('./models/Event.js');

const HACKERNEWS_NEWEST = "https://news.ycombinator.com/newest";
const HACKERNEWS_USER = (userId) => `https://news.ycombinator.com/submitted?id=${userId}`;
const NEWEST_EVENT_TYPE = "HackerNews.News.Updated";
const USER_EVENT_TYPE = "HackerNews.UserSubmissions.Updated";

let inMemoryNewestSubmissions = [];
let inMemoryUserSubmissionMap = {};

async function scrape(url) {
  try {
    const date = Date.now();
    const browser = await puppeteer.launch();
    const newPage = await browser.newPage();
    await newPage.goto(url, { waitUntil: "load", timeout: 0 });
  
    const submissions = await newPage.evaluate(() => {
      const selector = ".titlelink";
      const elements = Array.from(document.querySelectorAll(selector));
      const links = elements.map(element => element.href);
        return links;
    });
    
    await browser.close();

    // console.log(submissions);
    return submissions;
  } catch (error) {
    console.log(error);
  }
}

async function scrapeNewest() {
    const { err, data } = await Subscription.findByEventType(NEWEST_EVENT_TYPE);
    const newestSubmissions = await scrape(HACKERNEWS_NEWEST);
    const newestDiffs = newestSubmissions.filter((s) => !inMemoryNewestSubmissions.includes(s));

    // console.log(newestDiffs);

    if (newestDiffs.length) {
        data.forEach((subs) => {
            generateAndFireEvents(subs, newestDiffs);
        })
        inMemoryNewestSubmissions = newestSubmissions;
    }
}

async function scrapeUserSubmissions() {
    const { err, data } = await Subscription.findByEventType(USER_EVENT_TYPE);
    data.forEach((subs) => {
        scrapeUser(subs);
    })
}

async function scrapeUser(subscription) {
    const userId = JSON.parse(subscription.metadata).username;
    const userSubmissions = await scrape(HACKERNEWS_USER(userId));
    if (!userSubmissions.length) return;
    inMemoryUserSubmissionMap[userId] = inMemoryUserSubmissionMap[userId] || [];
    const userSubmissionDiffs = userSubmissions.filter((s) => !inMemoryUserSubmissionMap[userId].includes(s));

    if (userSubmissionDiffs.length) {
        generateAndFireEvents(subscription, userSubmissionDiffs);
        inMemoryUserSubmissionMap[userId] = userSubmissions;
    }
}

async function generateAndFireEvents(subscription, diffs) {
    const newEvent = new Event({
        eventType: subscription.event_type,
        subscriptionId: subscription.id,
        payload: JSON.stringify(diffs)
    });

    Event.create(newEvent)
    .then((resp) => {
        postEvent(subscription, resp.data)
    })
}

async function postEvent(subscription, event) {
    const body = {
        id: event.id,
        eventType: event.event_type,
        createdAt: event.created_at,
        payload: JSON.parse(event.payload),
        postURI: subscription.uri,
        subscriptionId: subscription.id
    };
    console.log("Firing event: ");
    console.log(body);
    fetch(subscription.uri,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
      }
    )
    .then((resp) => {
        if (!(resp.status >= 200 && resp.status < 300)) {
            console.error(`postEvent returned error status ${resp.status}`);
        } else {
            console.log("Event posted successfully")
        }
        SubscriptionStatus.updateStatus(new SubscriptionStatus({
            subscriptionId: subscription.id,
            statusCode: resp.status,
            message: resp.statusText || null
        }));
    })
    .catch((err) => {
        console.error(`postEvent returned error: ${err}`);
        SubscriptionStatus.updateStatus(new SubscriptionStatus({
            subscriptionId: subscription.id,
            statusCode: 500,
            message: err.reason || null
        }));
    })
  };

async function checkUpdatesAndFireEvents() {
    await scrapeNewest()
    await scrapeUserSubmissions()
}

const job = nodeCron.schedule("*/1 * * * *", checkUpdatesAndFireEvents);