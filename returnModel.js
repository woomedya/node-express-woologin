module.exports = (
    { status = true, data = null, auth = true, message = "", role = true } = {
        status: true,
        data: null,
        auth: true,
        message: "",
        role: true
    }
) => {
    return {
        status,
        auth,
        data,
        message,
        role
    };
};