exports.composeResponse = (err, data) => {
    const resp = {};
    if (err) resp['error'] = err;
    if (data) resp['data'] = data;

    return resp;
}