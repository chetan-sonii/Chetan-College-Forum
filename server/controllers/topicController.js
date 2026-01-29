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
          .populate({ path: "author", select: "firstName lastName username avatar" }) // ✅ Optimized Populate
          .lean()
          .exec();

      return res.status(200).json({ topics, currentPage: pageNum, totalPages, totalTopics });
    } catch (err) {
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
          .populate("tags")
          .populate({ path: "author", select: "-password -__v" })
          .lean()
          .exec();
      return res.status(200).json(topic);
    } catch (err) {
      console.log(err.message);
    }
  },

  // ✅ THIS IS THE FIXED FUNCTION
  addTopic: async (req, res) => {
    try {
      const { title, content, selectedSpace, selectedTags, poll } = req.body;

      // 1. Process Tags
      let createdTags = [];
      for (let index = 0; index < selectedTags.length; index++) {
        let name = selectedTags[index].value;
        let tagFound = await Tag.findOne({ name });
        if (!tagFound) {
          let tag = await Tag.create({ name, createdBy: req.user.username });
          createdTags.push(tag._id);
        } else {
          createdTags.push(tagFound._id);
        }
      }

      // 2. Generate Slug
      const slug = title.toString().normalize("NFKD").toLowerCase().trim()
          .replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\_/g, "-")
          .replace(/\-\-+/g, "-").replace(/\-$/g, "");

      // 3. Process Poll Data
      let pollData = null;
      if (poll && poll.question && poll.options.length >= 2) {
        let expiresAt = null;
        if (poll.duration > 0) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + parseInt(poll.duration));
        }
        pollData = {
          question: poll.question,
          options: poll.options.map(opt => ({ text: opt, votes: 0 })),
          voters: [],
          expiresAt: expiresAt
        };
      }

      // 4. Create Topic with AUTHOR and POLL
      let topic = await Topic.create({
        owner: req.user.username,
        title: title.trim(),
        content: content.trim(),
        slug: slug.trim(),
        tags: createdTags,
        space: selectedSpace,
        poll: pollData,
        author: req.user._id
      });

      topic = await topic.populate({ path: "author", select: "-password -__v" });

      return res.status(201).json({ topic, message: "Topic created successfully!" });
    } catch (err) {
      return res.status(400).json({ message: err.message });
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

      if (topic.poll.voters.some(v => v.toString() === userId.toString())) {
        return res.status(400).json({ message: "You have already voted" });
      }

      topic.poll.options[optionIndex].votes += 1;
      topic.poll.voters.push(userId);
      await topic.save();

      return res.status(200).json({ poll: topic.poll, topicId: id, message: "Vote registered!" });
    } catch (err) {
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
      console.log(err.message);
    }
  },
  getSpaces: async (req, res) => {
    try {
      const spaces = await Space.find({});
      return res.status(200).json(spaces);
    } catch (err) {
      console.log(err.message);
    }
  },
};