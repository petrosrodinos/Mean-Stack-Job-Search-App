const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address:{type:String,required:true},
  phone:{type:String,required:true},
  imagePath: { type: String, required: true },
  jobs:[{type:mongoose.Types.ObjectId,required:true,ref:'Job'}]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
