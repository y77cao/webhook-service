const dbConnection = require('./db.js');
const composeResponse = require('./utils.js').composeResponse;

const Subscription = function(subscription) {
    this.application_id = subscription.applicationId;
    this.event_type = subscription.eventType;
    this.uri = subscription.uri;
    this.metadata = subscription.metadata;
}

Subscription.create = (newSubscription) => {
    return dbConnection.query("INSERT IGNORE INTO subscriptions SET ?", newSubscription)
    .then((res) => {
        return composeResponse(null, { id: res.insertId, ...newSubscription });
    })
    .catch((err) => {
        console.log(err);
        return composeResponse(err, null);
    });
}

Subscription.batchCreate = (newSubscriptions) => {
    const subscriptionsWithStrigifiedMetadata = newSubscriptions.map((subs) => {
        return { ...subs, metadata: JSON.stringify(subs.metadata)};
    })
    const rows = subscriptionsWithStrigifiedMetadata.map((subs) => {
        return Object.values(subs);
    })
    
    return dbConnection.query("INSERT IGNORE INTO subscriptions " + 
    "(application_id, event_type, uri, metadata) VALUES ?", 
    [rows])
    .then((res) => {
        console.log(res);
        return composeResponse(null, res);
    })
    .catch((err) => {
        return composeResponse(err, null);
    });
}

Subscription.delete = (id) => {
    return dbConnection.query("DELETE FROM subscriptions WHERE id = ?", id)
    .then((res) => {
        if (res.affectedRows == 0) {
            return composeResponse({ kind: "not_found" }, null);
          }
        return composeResponse(null, res);
    })
    .catch((err) => {
        return composeResponse(err, null);
    });
}

Subscription.batchDelete = (ids) => {
    return dbConnection.query("DELETE FROM subscriptions WHERE id in (?)", [ids])
    .then((res) => {
        if (res.affectedRows == 0) {
            return composeResponse({ kind: "not_found" }, null);
          }
        return composeResponse(null, res);
    })
    .catch((err) => {
        return composeResponse(err, null);
    });
}

Subscription.findById = (id) => {
    return dbConnection.query(`SELECT * FROM subscriptions WHERE id = ${id}`)
    .then((res) => {
        if (res.length) {
            console.log("found subscription: ", res[0]);
            return composeResponse(null, res[0]);
        } else {
            return composeResponse({ kind: "not_found" }, null);
        }
    })
    .catch((err) => {
        console.log(err);
        return composeResponse(err, null);
    });
  };

  Subscription.findByURI = (URI) => {
    return dbConnection.query(`SELECT * FROM subscriptions WHERE uri = "${URI}"`)
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

  Subscription.findByURIs = (URIs) => {
    return dbConnection.query(`SELECT * FROM subscriptions WHERE uri in (?)`,[URIs])
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

  Subscription.getSubscriptionsWithStatusesByApplicationId = (appId) => {
    return dbConnection.query(`SELECT * FROM subscriptions JOIN subscription_status WHERE 
    subscriptions.application_id = ? AND 
    subscriptions.id = subscription_status.subscription_id`, appId)
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