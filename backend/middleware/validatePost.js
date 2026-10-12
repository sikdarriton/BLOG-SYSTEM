const Joi = require("joi");

const postSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "Post title is required",
            "string.min": "Title must be at least 3 characters",
            "string.max": "Title cannot exceed 100 characters",
            "any.required": "Post title is required",
        }),

    content: Joi.string()
        .trim()
        .min(10)
        .required()
        .messages({
            "string.empty": "Post content is required",
            "string.min": "Content must be at least 10 characters",
            "any.required": "Post content is required",
        }),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional()
        .messages({
            "string.pattern.base":
                "Slug must contain lowercase letters, numbers, and hyphens only",
        }),
});

const validatePost = (req, res, next) => {
    const { error, value } = postSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.details.map((detail) => detail.message),
        });
    }

    req.body = value;
    next();
};

module.exports = validatePost;