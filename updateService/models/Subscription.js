const dbConnection = require('./db.js');
const composeResponse = require('./utils.js').composeResponse;

const Subscription = function(subscription) {
    this.application_id = subscription.applicationId;
    this.event_type = subscription.eventType;
    this.uri = subscription.uri;
    this.metadata = subscription.metadata;
}

Subscription.findByEventType = (eventType) => {
    return dbConnection.query(`SELECT * FROM subscriptions WHERE event_type = "${eventType}"`)
    .then((res) => {
        if (res.length) {
            return composeResponse(null, res);
        } else {
            return composeResponse({ kind: "not_found" }, null);
        }
    })
    .catch((err) => {
        console.log(err);
        return composeResponse(err, null);
    });
};

module.exports = Subscription;