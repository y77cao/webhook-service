const dbConnection = require('./db.js');
const composeResponse = require('./utils.js').composeResponse;

const SubscriptionStatus = function(status) {
    this.subscription_id = status.subscriptionId;
    this.status_code = status.statusCode;
    this.message = status.message;
}

SubscriptionStatus.updateStatus = (status) => {
    return dbConnection.query(
        `UPDATE subscription_status SET status_code = ${status.status_code},
         message = "${status.message}" where subscription_id = ${status.subscription_id}`)
    .then((res) => {
        if (res.affectedRows == 0) {
            composeResponse({ kind: "not_found" }, null);
            return;
        } else return composeResponse(null, status);
    })
    .catch((err) => {
        console.log(err);
        return composeResponse(err, null);
    });
}

module.exports = SubscriptionStatus;