const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
    {
        owner: { type: String, required: true },
        title: { type: String, required: true },
        slug: { type: String, required: true },
        content: { type: String, required: true },
        space: { type: String }, // Assuming you added this from previous steps
        tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
        viewsCount: { type: Number, default: 0 },
        upvotes: [{ type: String }],
        downvotes: [{ type: String }],
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        // ✅ NEW POLL SCHEMA
        poll: {
            question: { type: String },
            options: [
                {
                    text: String,
                    votes: { type: Number, default: 0 },
                },
            ],
            voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Tracks who voted
            expiresAt: { type: Date }, // When the poll ends
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);