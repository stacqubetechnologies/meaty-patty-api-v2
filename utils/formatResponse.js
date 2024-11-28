
exports.successResponse = (data, message = 'Success') => ({
    success: true,
    message,
    data,
});

exports.errorResponse = (message = 'Error') => ({
    success: false,
    message,
});
