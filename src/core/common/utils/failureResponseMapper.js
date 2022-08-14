const failureResponseMapper = (body) => { 
    return {
        is_success: false,
        data: body,
    }
}

module.exports = failureResponseMapper;