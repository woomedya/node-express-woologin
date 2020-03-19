let returnModel = require("./returnModel");
let woorequest = require("./woorequest");
const cookie = require('cookie');
const AsyncRouter = require('express-async-router').AsyncRouter;
const userRouter = AsyncRouter();

let publicKey, privateKey, applicationId, loginUrl;

let init = (args) => {
    publicKey = args.publicKey;
    privateKey = args.privateKey;
    applicationId = args.applicationId;
    loginUrl = args.loginUrl[args.loginUrl.length - 1] == "/" ? args.loginUrl : (args.loginUrl + "/");
}

let verify = async function (req) {
    try {
        let result = await woorequest.post(
            loginUrl + "user/verifyapplication",
            req.body,
            {
                'public-key': publicKey,
                'Cookie': cookie.serialize('jwt', req.cookies.jwt)
            }
        );

        return result && result.auth;
    } catch (err) {
        return false;
    }
}

let auth = async function (req, res, next) {
    try {
        var result = await verify(req);

        if (result) {
            next();
        } else {
            res.send(
                returnModel({
                    status: false,
                    auth: false,
                    data: {
                        redirectUrl: loginUrl + "woologin?application=" + applicationId
                    }
                })
            );
        }
    } catch (error) {
        res.send(
            returnModel({
                status: false,
                auth: false,
                data: {
                    redirectUrl: loginUrl + "woologin?application=" + applicationId
                }
            })
        );
    }
}

userRouter.get('/sso', async (req, res) => {
    res.cookie('jwt', req.query.token);
    res.redirect("/")
})

userRouter.post('/verify', async (req, res) => {
    var result = await verify(req);
    res.send(returnModel({
        status: result,
        auth: result,
        data: {
            redirectUrl: loginUrl + "woologin?application=" + applicationId
        },
    }));
});

userRouter.post('/logout', async (req, res) => {
    res.clearCookie("jwt");

    let result = {
        data: {
            redirectUrl: loginUrl + "woologin?application=" + applicationId
        },
        status: true,
        auth: false
    };

    res.send(returnModel({ ...result }));
})

module.exports = {
    auth,
    init,
    userRouter
}