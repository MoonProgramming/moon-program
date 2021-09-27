exports.createAlert = (res, status, message) => {
    res.locals.alerts = [{
        status: status,
        message: message
    }];
};

exports.addAlert = (res, status, message) => {
    if (res.locals.alerts && res.locals.alerts.length > 0) {
        res.locals.alerts.push({
            status: status,
            message: message
        });
    } else {
        res.locals.alerts = [{
            status: status,
            message: message
        }];
    }  
};