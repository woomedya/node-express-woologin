module.exports = (
    { status = true, data = null, auth = true, message = "" } = {
        status: true,
        data: null,
        auth: true,
        message: ""
    }
) => {
    return {
        status,
        auth,
        data,
        message
    };
};