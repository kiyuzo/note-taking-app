import { Validator } from "jsonschema";

const v = new Validator();

const registerBodySchema = {
    type: "object",
    properties: {
        username: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            required: true
        },
        email: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,63}$/,
            required: true
        },
        password: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            required: true
        }
    },
    additionalProperties: false
}

const loginBodySchema = {
    type: "object",
    properties: {
        email: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,63}$/,
            required: true
        },
        password: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            required: true
        }
    },
    additionalProperties: false
}

const notesBodySchema = {
    type: "object",
    properties: {
        title: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            required: true
        },
        tags: {
            type: "array",
            items: {
                type: "string",
                maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
                pattern: /^[\w]+$/i
            },
            maxItems: parseInt(process.env.TAGS_QUANTITY_LIMIT),
            required: true
        },
        content: {
            type: "string",
            required: true
        },
        isFolder: {
            type: "boolean",
        },
        parentFolder: {
            type: ["number", "null"]
        },
    },
    additionalProperties: false
}

const shareBodySchema = {
    type: "object",
    properties: {
        to: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,63}$/,
            required: true
        },
        permission: {
            type: "number",
            minimum: 0,
            maximum: parseInt(process.env.MAXIMUM_PERMISSION),
            required: true
        }
    },
    additionalProperties: false
}

const updateUserBodySchema = {
    type: "object",
    properties: {
        username: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            required: true
        },
        password: {
            type: "string",
            maxLength: parseInt(process.env.INPUT_LENGTH_LIMIT),
            required: true
        }
    },
    additionalProperties: false
}

const tagsSchema = {
    type: "string",
    pattern: /^\w+(,\w*)*$/i
}

export function validateRegisterBody(instance) {
    return v.validate(instance, registerBodySchema).valid;
}

export function validateLoginBody(instance) {
    return v.validate(instance, loginBodySchema).valid;
}

export function validateNotesBody(instance) {
    return v.validate(instance, notesBodySchema).valid;
}

export function validateShareBody(instance) {
    return v.validate(instance, shareBodySchema).valid;
}

export function validateUpdateUserBody(instance) {
    return v.validate(instance, updateUserBodySchema).valid;
}

export function validateTags(instance) {
    return v.validate(instance, tagsSchema).valid;
}