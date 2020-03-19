let request = require("request");

const post = async (url, body, headers = {}) => {
    return new Promise((res, rej) => {
        request.post({
            url: url,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: {
                ...body
            },
            json: true
        }, async (error, response, body) => {
            if (response && response.statusCode == 200) {
                res(body);
            } else {
                rej(error);
            }
        });
    })
}


module.exports = {
    post
}