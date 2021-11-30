const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = async (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const {email,password,address,number} = req.body;
  try{
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password,salt);
    const user = new User({
    email: email,
    password: hashed,
    address:address,
    phone:number,
    imagePath: url + "/images/" + req.file.filename,
  });
  user
    .save()
    .then(result => {
      const token = jwt.sign(
        { email: result.email, userId: result._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(201).json({
        token: token,
        expiresIn: 3600,
        userId: result._id,
        email:result.email
      })
    }).catch(err=>{
      res.status(500).json({
        message: err.message
      });
    })

  }catch(err){
    console.log(err)
    res.status(500).json({
      message: err.message
    });
  }

}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        email:fetchedUser.email
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      });
    });
}
