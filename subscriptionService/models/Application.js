const dbConnection = require('./db.js');
const composeResponse = require('./utils.js').composeResponse;

const Application = function(application) {
    this.developer_id = application.developerId;
    this.name = application.name;
}

Application.create = (newApplication) => {
    return dbConnection.query("INSERT INTO applications SET ?", newApplication)
    .then((res) => {
        return composeResponse(null, { id: res.insertId, ...newApplication });
    })
    .catch((err) => {
        console.log(err);
        return composeResponse(err, null);
    });
}

Application.delete = (id) => {
    dbConnection.query("DELETE FROM applications WHERE id = ?", id) 
    .then((res) => {
        if (res.affectedRows == 0) {
            composeResponse({ kind: "not_found" }, null);
            return;
        } else {
            console.log("deleted application with id: ", id);
            return composeResponse(null, res);
        }
    })
    .catch((err) => {
        console.log(err);
        return composeResponse(err, null);
    });
}

Application.findById = (id) => {
    return dbConnection.query(`SELECT * FROM applications WHERE id = ${id}`)
    .then((res) => {
        if (res.length) {
            console.log("found application: ", res[0]);
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

module.exports = Application;