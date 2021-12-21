// IMPORTS:
const {Post, validatePost, validateLike} = require("../models/post");
const express = require("express");
const router = express.Router();


// ROUTES:

//Tested Success:
router.get("/post/:id", async (req, res) => {
    
    try{
        const posts = await Post.find(
            { userId: req.params.id }
        );

        return res.send(posts);
    }catch(ex){
        console.log("Couldn't Retrieve Post");
        return res.status(500).send(`InternalServerError:${ex}`);
    }
});

//Tested Success:
router.post("/post", async (req, res) => {
    try{
        const { error } = validatePost(req.body);
        if(error) return res.status(400).send(error);

        const post = new Post({
            userId: req.body.userId,
            name: req.body.name,
            postBody: req.body.postBody,
            timeStamp: req.body.timeStamp
        });

        await post.save();

        return res.send(post);
    }catch(ex){
        console.log("Couldn't Create New Post");
        return res.status(500).send(`InternalServerError:${ex}`);
    }
});

router.put("/post/:postId", async (req, res) => {
    try{
        const {error} = validateLike(req.body);
        if(error) return res.status(400).send(error);

        const post = await Post.findOneAndUpdate(
            {
                _id: req.params.postId
            },
            {
                like: req.body.like
            },
            {new: true}
        );

        await post.save();
        return res.send(post);
    }catch(ex){
        console.log("Couldn't Update Post");
        return res.status(500).send(`InternalServerError:${ex}`);
    }
});

router.delete("/post/:id", async (req, res) => {
    try{
        const post = await Post.findByIdAndDelete( req.params.id );

        return res.send(post);

    }catch(ex){
        console.log("Couldn't Delete Post");
        return res.status(500).send(`InternalServerError:${ex}`);
    }
});

module.exports = router;