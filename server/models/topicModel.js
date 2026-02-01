const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
    {
        owner: { type: String, required: true },
        title: { type: String, required: true },
        slug: { type: String, required: true },
        content: { type: String, required: true },
        space: { type: String },
        tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
        viewsCount: { type: Number, default: 0 },

        // ✅ ADD THIS FIELD
        totalComments: { type: Number, default: 0 },

        upvotes: [{ type: String }],
        downvotes: [{ type: String }],
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        poll: {
            question: { type: String },
            options: [{ text: String, votes: { type: Number, default: 0 } }],
            voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            expiresAt: { type: Date },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);