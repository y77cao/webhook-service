const Subscription = require('../models/Subscription.js');
const SubscriptionStatus = require('../models/SubscriptionStatus.js');
const Application = require('../models/Application.js');

exports.create = async (req, res) => {
    const params = req.params;
    const applicationId = params.applicationId;
 
    if (!applicationId) {
        res.status(400).send({ message: 'Invalid application id'});
        return;
    }
    if (!Object.keys(req.body).length) {
        res.status(400).send({ message: 'Invalid empty body'});
        return;
    }

    const { err, data } = await Application.findById(applicationId);

    if (err && err.kind && err.kind === 'not_found') {
        res.status(400).send({ message: `Unable to find application with id ${applicationId}`});
        return;
    }

    const errors = validateBody(req.body);
    if (errors.length) {
        res.status(400).send({ message: 'Invalid URI(s)', details: errors });
        return;
    }

    const subscriptions = generateSubscriptions(applicationId, req.body);
    console.log(subscriptions);

    Subscription.batchCreate(subscriptions)
    .then((data) => {
        generateAndSaveStatuses(subscriptions)
    })
    .then((data) => {
        res.sendStatus(200);
    })
    .catch((err) => {
        res.status(500).send({
            message:
              err.message || "Some error occurred while creating the subscription."
          });
    });
}

exports.delete = async (req, res) => {
    const params = req.params;
    const applicationId = params.applicationId;
    const URI = decodeURIComponent(params.uri).replace(/[<>]/g, "");
  
    if (!applicationId) {
        res.status(400).send({ message: 'Invalid application id'});
        return;
    }

    if (!URI) {
        res.status(400).send({ message: 'Invalid URI'});
        return;
    }
    
    const { err, data } = await Subscription.findByURI(URI);
    if (err && err.kind && err.kind === 'not_found') {
        res.status(400).send({ message: `Unable to find webhook for URI: ${URI}`});
        return;
    }

    console.log(data);
    Subscription.delete(data.map((d) => d.id))
    .then((data) => res.sendStatus(200))
    .catch((err) => {
        res.status(500).send({
            message:
              err.message || "Some error occurred while deleting the subscription."
          });
    });   
}

exports.getStatuses = (req, res) => {
    const params = req.params;
    const applicationId = params.applicationId;

    if (!applicationId) {
        res.status(400).send({ message: 'Invalid application id'});
        return;
    }
    
    Subscription.getSubscriptionsWithStatusesByApplicationId(applicationId)
    .then((result) => {
        const resp = composeStatusesResponse(result.data)
        res.status(200).send(resp);
    })
}

const validateBody = (body) => {
    const errors = [];
    for (let key in body) {
        if (key[0] != "<" || key[key.length - 1] != ">") {
            // errors.push(`Invalid key format ${key}`);
        } else {
            const URI = key.replace(/[<>]/g, "");
            const validURI = validateURI(URI);
            if (!validURI) errors.push(`Invalid URI ${key}`);
        }
    }
    
    // TODO valdiate metadata
    return errors;
}

const validateURI = (str) => {
    let url;

    try {
      url = new URL(str);
    } catch (_) {
      return false;  
    }
    if (url.protocol === "https:") return true;
    else if (url.protocol === "http:") {
        return url.hostname === "127.0.0.1" || url.hostname === "localhost";
    }

    return false;
}

const generateSubscriptions = (applicationId, body) => {
    return Object.entries(body).map(([uri, metadata]) => {
        return new Subscription({
            applicationId: applicationId,
            eventType: getEventType(metadata),
            uri: uri.replace(/[ <>]/g, ""),
            metadata: metadata
        });
    })
}

const getEventType = (metadata) => {
    console.log(metadata);
    if (Object.keys(metadata).includes('username')) {
        return "HackerNews.UserSubmissions.Updated";
    } else return "HackerNews.News.Updated";
}

const generateAndSaveStatuses = async (subscriptions) => {
    const URIs = subscriptions.map((s) => s.uri);
    console.log(URIs)
    const subscriptionsWithId = await Subscription.findByURIs(URIs);
    const statuses = subscriptionsWithId.data.map((subs) => {
        return new SubscriptionStatus({
            subscriptionId: subs.id,
            statusCode: 200, // TODO maybe we can ping the endpoint to fill this
            message: ""
        });
    });

    return SubscriptionStatus.batchCreate(statuses);
}

const composeStatusesResponse = (data) => {
    if (!data) return {};
    return data.reduce((result, entry) => {
        const obj = {};
        const metadata = JSON.parse(entry.metadata);
        if (entry.status_code != 200) {
            metadata['status'] = `${entry.status_code} ${entry.message}`;
        } else {
            metadata['status'] = "";
        }
        const key = `<${entry.uri}>`;
        obj[key] = metadata;
        return { ...result, ...obj };
    }, {});
}