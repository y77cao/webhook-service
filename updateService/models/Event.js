const dbConnection = require('./db.js');
const composeResponse = require('./utils.js').composeResponse;

const Event = function(event) {
    this.event_type = event.eventType;
    this.subscription_id = event.subscriptionId;
    this.payload = event.payload;
    this.created_at = new Date();
}

Event.create = (newEvent) => {
    return dbConnection.query("INSERT IGNORE INTO events SET ?", newEvent)
    .then((res) => {
        return composeResponse(null, { id: res.insertId, ...newEvent });
    })
    .catch((err) => {
        console.log(err);
        return composeResponse(err, null);
    });
}

module.exports = Event;