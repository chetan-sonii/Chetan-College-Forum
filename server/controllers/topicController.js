const Topic = require("../models/topicModel");
const Tag = require("../models/tagModel");
const Comment = require("../models/commentModel");
const Space = require("../models/spaceModel");

module.exports = {
  getAllTopics: async (req, res) => {
    try {
      const { search, sort, space, page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      let sortOptions = { createdAt: -1 };
      let searchQuery = {};

      if (search) searchQuery.title = new RegExp(search, "i");
      if (space && space !== "undefined") searchQuery.space = space;

      if (sort === "popular") sortOptions = { viewsCount: -1 };
      else if (sort === "most_replied") sortOptions = { totalComments: -1 };
      else if (sort === "most_upvoted") sortOptions = { upvotes: -1 };

      const totalTopics = await Topic.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalTopics / limitNum);

      let topics = await Topic.find(searchQuery)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .populate("tags")
          .populate({ path: "author", select: "firstName lastName username avatar" })
          .lean()
          .exec();

      return res.status(200).json({ topics, currentPage: pageNum, totalPages, totalTopics });
    } catch (err) {
	console.log(err);


      return res.status(500).json({ message: err.message });
    }
  },

  getTopic: async (req, res) => {
    const { slug } = req.params;
    try {
      const topic = await Topic.findOneAndUpdate(
          { slug },
          { $inc: { viewsCount: 1 } },
          { returnOriginal: false }
      )
          .populate('author', 'firstName lastName')
          .populate('space', 'name')
          .lean()
          .exec();
      return res.status(200).json(topic);
    } catch (err) {
	console.log(err);


      console.log(err.message);
    }
  },

  // ✅ THIS IS THE FIXED FUNCTION
  addTopic: async (req, res) => {
    try {
      const { title, content, space, tags } = req.body;

      // 1. Generate Slug (Required by Schema)
      // Converts "My New Topic" -> "my-new-topic"
      const slug = title
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "");

      // 2. Create the topic
      let newTopic = await Topic.create({
        title,
        content,
        space,
        tags,
        slug: slug,               // <--- Added missing field
        owner: req.user.username, // <--- Added missing field (Schema requires a String owner)
        author: req.user._id,     // Keep author as ObjectId for population
      });

      // 3. Populate the author details immediately
      newTopic = await newTopic.populate({
        path: "author",
        select: "firstName lastName username avatar",
      });

      return res.status(201).json(newTopic);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  voteOnPoll: async (req, res) => {
    const { id } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    try {
      const topic = await Topic.findById(id);
      if (!topic || !topic.poll) return res.status(404).json({ message: "Poll not found" });

      if (topic.poll.expiresAt && new Date() > new Date(topic.poll.expiresAt)) {
        return res.status(400).json({ message: "Poll has expired" });
      }

      if (topic.poll.voters.some(v => v === userId)) {
        return res.status(400).json({ message: "You have already voted" });
      }

      topic.poll.options[optionIndex].votes += 1;
      topic.poll.voters.push(userId);
      await topic.save();

      return res.status(200).json({ poll: topic.poll, topicId: id, message: "Vote registered!" });
    } catch (err) {
	console.log(err);



      return res.status(500).json({ message: err.message });
    }
  },
  // ... keep deleteTopic, toggleUpvoteTopic, toggleDownvoteTopic, getTopContributors, getSpaces ...
  deleteTopic: async (req, res) => {
    try {
      const { id } = req.params;
      const topic = await Topic.findById(id).populate("author", {
        _id: 0,
        username: 1,
      });
      if (!topic) {
        return res.status(404).json({
          message: "Could not find topic for the provided ID.",
        });
      }
      if (req.user.username !== topic.author.username) {
        return res.status(403).json({
          message: "You are not allowed to delete this topic",
        });
      }
      await Comment.deleteMany({ parentTopic: id });
      await Topic.findByIdAndDelete(id);
      return res.json({ topicId: id, message: "Topic deleted successfully!" });
    } catch (err) {
	console.log(err);


      console.log(err.message);
    }
  },
  toggleUpvoteTopic: async (req, res) => {
    const { id } = req.params;
    try {
      const topic = await Topic.findById(id);
      if (!topic) {
        return res.status(404).json({
          message: "Topic not found!",
        });
      }
      if (topic.upvotes.includes(req.user.username)) {
        topic.upvotes.pull(req.user.username);
        await topic.save();
        return res.status(200).json({
          topicId: id,
          username: req.user.username,
          message: "Topic was upvoted successfully.",
        });
      } else {
        topic.upvotes.push(req.user.username);
        topic.downvotes.pull(req.user.username);
        await topic.save();
        return res.status(200).json({
          topicId: id,
          username: req.user.username,
          message: "Topic was upvoted successfully.",
        });
      }
    } catch (err) {
	console.log(err);


      return res.status(403).json({
        Error: err.message,
      });
    }
  },
  toggleDownvoteTopic: async (req, res) => {
    const { id } = req.params;
    try {
      const topic = await Topic.findById(id);
      if (!topic) {
        return res.status(404).json({
          message: "Topic not found!",
        });
      }
      if (topic.downvotes.includes(req.user.username)) {
        topic.downvotes.pull(req.user.username);
        await topic.save();
        return res.status(200).json({
          topicId: id,
          username: req.user.username,
          message: "Topic was downvoted successfully.",
        });
      } else {
        topic.downvotes.push(req.user.username);
        topic.upvotes.pull(req.user.username);
        await topic.save();
        return res.status(200).json({
          topicId: id,
          username: req.user.username,
          message: "Topic was downvoted successfully.",
        });
      }
    } catch (err) {
	console.log(err);


      return res.status(403).json({
        Error: err.message,
      });
    }
  },
  getTopContributors: async (req, res) => {
    try {
      let topContributors = await Topic.aggregate([
        { $group: { _id: "$owner", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "username",
            as: "author",
            pipeline: [{ $project: { password: 0, __v: 0 } }],
          },
        },
        { $unwind: "$author" },
        { $limit: 3 },
      ]);
      return res.status(200).json(topContributors);
    } catch (err) {
	console.log(err);


      console.log(err.message);
    }
  },
  getSpaces: async (req, res) => {
    try {
      const spaces = await Space.find({});
      return res.status(200).json(spaces);
    } catch (err) {
	console.log(err);


      console.log(err.message);
    }
  },
};