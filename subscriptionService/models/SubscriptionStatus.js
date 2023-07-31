const dbConnection = require('./db.js');
const composeResponse = require('./utils.js').composeResponse;

const SubscriptionStatus = function(status) {
    this.subscription_id = status.subscriptionId;
    this.status_code = status.statusCode;
    this.message = status.essage;
}

SubscriptionStatus.create = (newStatus) => {
    return dbConnection.query("INSERT IGNORE INTO subscription_status SET ?", newStatus)
    .then((res) => {
        return composeResponse(null, { id: res.insertId, ...newStatus });
    })
    .catch((err) => {
        console.log(err);
        return composeResponse(err, null);
    });
}

SubscriptionStatus.batchCreate = (newStatuses) => {
    const rows = newStatuses.map((status) => {
        return Object.values(status);
    })
    
    return dbConnection.query("INSERT IGNORE INTO subscription_status " + 
    "(subscription_id, status_code, message) VALUES ?", 
    [rows])
    .then((res) => {
        return composeResponse(null, res);
    })
    .catch((err) => {
        return composeResponse(err, null);
    });
}

module.exports = SubscriptionStatus;