const mongoose = require("mongoose");
// ❌ REMOVED: const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
  password: String,
  avatar: {
    public_id: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: "https://i.imgur.com/iV7Sdgm.jpg",
    },
  },
  cover: {
    public_id: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: "https://i.imgur.com/CAFy1oY.jpg",
    },
  },
  socialNetwork: {
    facebook: {
      type: String,
      trim: true,
      match:
          /(?:https?:\/\/)?(?:www\.|m\.|mobile\.|touch\.|mbasic\.)?(?:facebook\.com|fb(?:\.me|\.com))\/(?!$)(?:(?:\w)*#!\/)?(?:pages\/|pg\/)?(?:photo\.php\?fbid=)?(?:[\w\-]*\/)*?(?:\/)?(?:profile\.php\?id=)?([^\/?&\s]*)(?:\/|&|\?)?.*/gm,
      default: "",
    },
    twitter: {
      type: String,
      trim: true,
      match: /^(?:https?:\/\/)?(?:www\.)?twitter\.com\/(#!\/)?[a-zA-Z0-9_]+$/i,
      default: "",
    },
    github: {
      type: String,
      trim: true,
      match: /^(?:https?:\/\/)?(?:www\.)?github\.com\/(#!\/)?[a-zA-Z0-9_]+$/i,
      default: "",
    },
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: "A new user of CHETAN forum",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  following: [
    {
      type: String,
      ref: "User",
      default: [],
    },
  ],
  followers: [
    {
      type: String,
      ref: "User",
      default: [],
    },
  ],
}, { timestamps: true }); // Enable timestamps (createdAt, updatedAt)

// ❌ REMOVED: UserSchema.plugin(AutoIncrement, { inc_field: "UserID" });

// Virtual for getting full name
UserSchema.virtual("fullname").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);