const Job = require("../models/job");
const User = require("../models/user");

exports.createJob = async (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const job = new Job({
    title: req.body.title,
    content: req.body.content,
    price:req.body.price,
    creator: req.userData.userId,
    imagePath: url + "/images/" + req.file.filename,
  });
  let user;
  try{
    user = await User.findById(req.userData.userId);
  }catch(err){
    console.log("1: "+err)
    res.status(500).json({
      message: "1 Creating a post failed!"
    });
  }

  try{
    await job.save();
    // user.jobs.push(job);
    // await user.save();
  }catch(err){
    console.log("2: "+err)
    res.status(500).json({
      message: err.message
    });
  }

  // try{
  //   const sess = await mongoose.startSession();
  //   sess.startTransaction();
  //   await job.save({ session: sess });
  //   user.jobs.push(job);
  //   await user.save({ session: sess });
  //   await sess.commitTransaction();
  // }catch(err){
  //   console.log("2: "+err)
  //   res.status(500).json({
  //     message: "2 Creating a post failed!"
  //   });
  // }

  res.status(201).json({
    message: "Post added successfully",
    post: {
      ...job,
      id: job._id
    }
  });
};

exports.updateJob = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const job = new Job({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    price:req.body.price,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Job.updateOne({ _id: req.params.id, creator: req.userData.userId }, job)
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't udpate post!"
      });
    });
};

exports.getJobs = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Job.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Job.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
};

exports.getJobsById = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const id = req.params.id;
  const postQuery = Job.find({creator:id});
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Job.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      console.log(err);
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
};

exports.getJob =  (req, res, next) => {
  Job.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching post failed!"
      });
    });
};

exports.deleteJob = (req, res, next) => {
  Job.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      console.log(result);
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Deleting posts failed!"
      });
    });
};
