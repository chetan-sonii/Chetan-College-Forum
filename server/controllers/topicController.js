const Topic = require("../models/topicModel");
const Tag = require("../models/tagModel");
const Comment = require("../models/commentModel");
const Space = require("../models/spaceModel");

module.exports = {
  getAllTopics: async (req, res) => {
    try {
      // ✅ ADD 'tag' to query parameters
      const { search, sort, space, tag, page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      let sortOptions = { createdAt: -1 };
      let searchQuery = {};

      if (search) searchQuery.title = new RegExp(search, "i");
      if (space && space !== "undefined") searchQuery.space = space;

      // ✅ NEW: Filter by Tag Name
      if (tag && tag !== "undefined" && tag !== "") {
        const tagDoc = await Tag.findOne({ name: tag });
        if (tagDoc) {
          searchQuery.tags = tagDoc._id;
        } else {
          // If tag doesn't exist, return empty list immediately
          return res.status(200).json({ topics: [], currentPage: 1, totalPages: 0, totalTopics: 0 });
        }
      }

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
    // ... (Keep existing getTopic code)
    const { slug } = req.params;
    try {
      const topic = await Topic.findOneAndUpdate(
          { slug },
          { $inc: { viewsCount: 1 } },
          { returnOriginal: false }
      )
          .populate('author', 'firstName lastName username avatar')
          .populate('space', 'name')
          // ✅ Populate tags here too just in case
          .populate('tags')
          .lean()
          .exec();
      return res.status(200).json(topic);
    } catch (err) {
      console.log(err);
      console.log(err.message);
    }
  },

  addTopic: async (req, res) => {
    try {
      // ✅ FIX: Read 'selectedTags' instead of 'tags'
      const { title, content, space, selectedTags, poll } = req.body;

      // 1. Generate Slug
      const slug = title
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "");

      // 2. Process Poll Data (Keep your existing poll fix)
      let pollData = null;
      if (poll) {
        const days = poll.duration || 1;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        const options = poll.options.map((opt) => ({ text: opt, votes: 0 }));
        pollData = { question: poll.question, options: options, expiresAt: expiresAt, voters: [] };
      }

      // 3. ✅ NEW: Process Tags (Find or Create)
      const tagIds = [];
      if (selectedTags && selectedTags.length > 0) {
        for (const tagItem of selectedTags) {
          // Frontend sends objects { label: 'name', value: 'name' }
          const tagName = tagItem.value || tagItem;

          let tagDoc = await Tag.findOne({ name: tagName });
          if (!tagDoc) {
            tagDoc = await Tag.create({ name: tagName });
          }
          tagIds.push(tagDoc._id);
        }
      }

      // 4. Create the topic
      let newTopic = await Topic.create({
        title,
        content,
        space,
        tags: tagIds, // ✅ Save the processed ObjectIds
        slug: slug,
        owner: req.user.username,
        author: req.user._id,
        poll: pollData,
      });

      // 5. Populate details
      newTopic = await newTopic.populate([
        { path: "author", select: "firstName lastName username avatar" },
        { path: "tags" } // Populate tags for immediate display
      ]);

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