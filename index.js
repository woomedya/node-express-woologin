let returnModel = require("./returnModel");
let woorequest = require("./woorequest");
const cookie = require('cookie');
const AsyncRouter = require('express-async-router').AsyncRouter;
const userRouter = AsyncRouter();

let publicKey, privateKey, applicationId, loginUrl, permissions;

let init = (args) => {
    publicKey = args.publicKey;
    privateKey = args.privateKey;
    applicationId = args.applicationId;
    loginUrl = args.loginUrl[args.loginUrl.length - 1] == "/" ? args.loginUrl : (args.loginUrl + "/");
    permissions = args.permissions;
}

let verify = async function (req, verifyUrl) {
    try {
        let result = await woorequest.post(
            loginUrl + verifyUrl,
            req.body,
            {
                'public-key': publicKey,
                'Cookie': cookie.serialize('jwt', req.cookies.jwt)
            }
        );

        req.body.woouserdata = result && result.data;
        return !result || !result.auth ? false : { auth: true, role: result.role };
    } catch (err) {
        return false;
    }
}

let request = async function (req, reqUrl) {
    try {
        let result = await woorequest.post(
            loginUrl + reqUrl,
            req.body,
            {
                'public-key': publicKey,
                'Cookie': cookie.serialize('jwt', req.cookies.jwt)
            }
        );

        return result;
    } catch (err) {
        return null;
    }
}

let auth = async function (req, res, next) {
    try {
        var result = await verify(req, "user/verifyapplication");

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

let authRole = (permissions) => {
    return async function (req, res, next) {
        try {
            req.body.permissionIds = permissions;
            var result = await verify(req, "role/verify");

            if (result && result.role) {
                next();
            } else {
                return res.send(
                    returnModel({
                        status: false,
                        auth: true,
                        role: false
                    })
                );
            }
        } catch (error) {
            return res.send(
                returnModel({
                    status: false,
                    auth: true,
                    role: false
                })
            );
        }
    }
}

let authForServer = async function (req, res, next) {
    try {
        var result = await verify(req, "user/verifyapplicationserver");

        if (result) {
            next();
        } else {
            res.send(
                returnModel({
                    status: false,
                    auth: false
                })
            );
        }
    } catch (error) {
        res.send(
            returnModel({
                status: false,
                auth: false
            })
        );
    }
}

userRouter.get('/sso', async (req, res) => {
    res.cookie('jwt', req.query.token);
    res.redirect("/")
})

userRouter.post('/verify', async (req, res) => {
    var result = await verify(req, "user/verifyapplication");
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
});

userRouter.post('/permissions', async (req, res) => {
    var result = await verify(req, "user/verifyapplicationserver");

    return res.send(returnModel({
        status: result,
        auth: result,
        data: result ? {
            permissions
        } : null,
    }));
});

userRouter.post('/permissionlist', async (req, res) => {
    var result = await request(req, "role/listforclient");

    return res.send(returnModel(result));
});

userRouter.post('/userlistforselect', async (req, res) => {
    var result = await request(req, "user/listforclientselect");

    return res.send(returnModel(result));
});

userRouter.post('/rolelistforselect', async (req, res) => {
    var result = await request(req, "role/listforclientselect");

    return res.send(returnModel(result));
});

module.exports = {
    auth,
    init,
    userRouter,
    authForServer,
    authRole
}