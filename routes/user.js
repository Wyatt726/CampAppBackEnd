const { User, validateLogin, validateUser } = require("../models/user");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const bcrypt = require("bcrypt");
const express = require("express");
const res = require("express/lib/response");
const router = express.Router();

//* POST register a new user
router.post("/user/register", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send(`Email ${req.body.email} already claimed!`);

    const salt = await bcrypt.genSalt(10);
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
      isAdmin: req.body.isAdmin,
      friends: [],
    });

    await user.save();
    const token = user.generateAuthToken();
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
//* POST a valid login attempt
//! when a user logs in, a new JWT token is generated and sent if their email/password credentials are correct
router.post("/user/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send(`Invalid email or password.`);

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    const token = user.generateAuthToken();
    return res.send(token);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* Get logged in user
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findOne({_id: req.params.userId});
    return res.send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//GET User's Info
router.get("/user/info/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId});
    if(!user){
      return res
        .status(400)
        .send(`User doesn't exist!`);
    }else{
      const userInfo = {
        src: user.src,
        bio: user.bio
      }
      return res.send(userInfo);
    }
  } catch (error) {
    return res.status(500).send(`Internal Server Error: ${error}`);
  }
});

//GET All User's
router.get("/user", async (req, res) => {
  try {
    const users = await User.find();
    return res.send(users);
  } catch (error) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//Update User's Photo
router.put("/user/photo/:id", async (req, res) => {
  try{
    const user = await User.findByIdAndUpdate(
      {
        _id: req.params.id
      },
      {
        src: req.body.src
      },
      {
        new: true
      }
    );

    await user.save();

    return res.send(user);
    
  }catch(error){
    console.log("Couldn't Update Photo");
  }
});

//Update User's Bio
router.put("/user/bio/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      {
        _id: req.params.id
      },
      {
        bio: req.body.bio
      },
      {
        new: true
      }
    );

    await user.save();

    return res.send(user);
  } catch (error) {
    
  }
});

//* DELETE a single user from the database
router.delete("/user/:userId", [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.params.userId} does not exist!`);
    await user.remove();
    return res.send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

module.exports = router;
