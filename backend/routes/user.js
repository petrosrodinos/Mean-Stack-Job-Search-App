const express = require("express");
const extractFile = require("../middleware/file");

const UserController = require("../controllers/user");

const router = express.Router();

router.post("/signup",extractFile, UserController.createUser);

router.post("/login", UserController.userLogin);

module.exports = router;
