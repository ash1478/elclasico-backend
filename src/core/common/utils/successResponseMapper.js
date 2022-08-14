module.exports = function successResponseMapper(body) { 
    return {
        is_success: true,
        data: body,
    }
}