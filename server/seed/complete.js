const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const connectDB = require("../config/db");

// Import Models
const User = require("../models/userModel");
const Topic = require("../models/topicModel");
const Space = require("../models/spaceModel");
const Tag = require("../models/tagModel");

dotenv.config();

// --- Configuration ---
const PASSWORD_TO_HASH = "user123";
const KEEP_USERS = process.argv.includes("--keep-users"); // Check for flag

const usersData = [
    { firstName: "Alice", lastName: "Smith", username: "alice_smith", email: "alice@example.com" },
    { firstName: "Bob", lastName: "Jones", username: "bob_jones", email: "bob@example.com" },
    { firstName: "Charlie", lastName: "Brown", username: "charlie_brown", email: "charlie@example.com" },
    { firstName: "Diana", lastName: "Prince", username: "diana_prince", email: "diana@example.com" },
    { firstName: "Evan", lastName: "Wright", username: "evan_wright", email: "evan@example.com" },
];

const spacesData = [
    { name: "Technology", avatar: "https://cdn-icons-png.flaticon.com/512/1087/1087815.png" },
    { name: "Music", avatar: "https://cdn-icons-png.flaticon.com/512/461/461238.png" },
    { name: "Business", avatar: "https://cdn-icons-png.flaticon.com/512/1063/1063376.png" },
    { name: "Science", avatar: "https://cdn-icons-png.flaticon.com/512/2933/2933116.png" },
    { name: "Health", avatar: "https://cdn-icons-png.flaticon.com/512/2966/2966334.png" },
];

const dummyTags = ["react", "javascript", "career", "startup", "fitness", "piano", "finance", "ai"];

// --- Helper: Slug Generator ---
const generateSlug = (title) => {
    return title
        .toString()
        .normalize("NFKD")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\_/g, "-")
        .replace(/\-\-+/g, "-")
        .replace(/\-$/g, "");
};

// --- Main Seed Function ---
const seed = async () => {
    try {
        await connectDB();
        console.log("✅ DB Connected.");

        // 1. CLEAR DATA
        // We always clear content to ensure the "5 topics per user" rule is clean
        await Topic.deleteMany({});
        await Space.deleteMany({});
        await Tag.deleteMany({});
        console.log("🗑️  Topics, Spaces, and Tags cleared.");

        if (KEEP_USERS) {
            console.log("ℹ️  Skipping User deletion (--keep-users flag detected).");
        } else {
            await User.deleteMany({});
            console.log("🗑️  Users cleared.");
        }

        // 2. CREATE SPACES
        const createdSpaces = await Space.insertMany(spacesData);
        console.log("🌌 Spaces created.");

        // 3. CREATE TAGS
        const tagDocs = dummyTags.map((name) => ({ name, createdBy: "system" }));
        const createdTags = await Tag.insertMany(tagDocs);
        console.log("🏷️  Tags created.");

        // 4. HANDLE USERS (Create or Find)
        const hashedPassword = await bcrypt.hash(PASSWORD_TO_HASH, 10);
        const targetUsers = [];

        console.log("👥 Processing Users...");
        for (const u of usersData) {
            // Check if user exists
            let user = await User.findOne({ $or: [{ email: u.email }, { username: u.username }] });

            if (user) {
                if (KEEP_USERS) {
                    console.log(`   ~ Found existing user: ${u.username}`);
                    // Optional: Update their password to match the seed password if needed
                    // user.password = hashedPassword;
                    // await user.save();
                } else {
                    // Should theoretically not happen if deleteMany worked, but safety first
                    console.log(`   ! User collision for ${u.username}, using existing.`);
                }
            } else {
                // Create new
                user = await User.create({
                    ...u,
                    password: hashedPassword,
                    isVerified: true,
                    bio: `Hi, I am ${u.firstName}. I love discussing topics on this forum!`,
                    avatar: {
                        url: `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=random&size=200`
                    }
                });
                console.log(`   + Created user: ${u.username}`);
            }
            targetUsers.push(user);
        }

        // 5. CREATE TOPICS (5 per user)
        const topics = [];

        for (const user of targetUsers) {
            for (let i = 1; i <= 5; i++) {
                const space = createdSpaces[Math.floor(Math.random() * createdSpaces.length)];
                const shuffledTags = createdTags.sort(() => 0.5 - Math.random());
                const selectedTags = shuffledTags.slice(0, Math.floor(Math.random() * 3) + 1);

                const title = `${user.firstName}'s thoughts on ${space.name} - Post #${i}`;

                topics.push({
                    owner: user.username,
                    title: title,
                    slug: generateSlug(title),
                    content: `This is a sample discussion about **${space.name}**.\n\nI believe this is an important topic because it affects how we view the industry.\n\n*Feel free to reply with your thoughts!*`,
                    space: space.name,
                    tags: selectedTags.map(t => t._id),
                    viewsCount: Math.floor(Math.random() * 500),
                    upvotes: [],
                    downvotes: [],
                    author: user._id
                });
            }
        }

        await Topic.insertMany(topics);
        console.log(`📝 ${topics.length} Topics created (5 per user).`);

        console.log("✨ SEEDING COMPLETE! ✨");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
};

seed();