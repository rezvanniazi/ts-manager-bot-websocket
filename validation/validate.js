const validate = (schema, input) => {
    const { error } = schema.validate(input, {
        abortEarly: false, // Return all errors, not just the first
        allowUnknown: false, // Disallow unknown keys
        stripUnknown: true, // Remove unknown keys
        convert: true,
    })
    if (error) {
        console.log(error)
        const errors = error.details.map((detail) => {
            console.log(detail)
            return { field: detail.path.join("."), message: detail.message.replace(/"/g, "") }
        })

        console.log(errors)
        throw new Error()
    }
    return input
}

module.exports = validate
