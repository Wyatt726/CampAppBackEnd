const mongoose = require("mongoose");
const Joi = require("joi");

const postSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    name: {type: String},
    postBody: {type: String, required: true},
    like: {type: Number, default: 0},
    timeStamp: {type: Number}
})

const Post = mongoose.model('Post', postSchema);

function validatePost(Post){
    const schema = Joi.object({
        userId: Joi.string().required(),
        name: Joi.string().required(),
        postBody: Joi.string().required(),
        like: Joi.number(),
        timeStamp: Joi.number().required()
    });
    return schema.validate(Post);
}

function validateLike(Post){
    const schema = Joi.object({
        like: Joi.number()
    })
    return schema.validate(Post);
}

module.exports = {
    Post: Post,
    validatePost: validatePost,
    validateLike: validateLike
}

