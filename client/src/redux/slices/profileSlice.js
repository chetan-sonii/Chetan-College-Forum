// src/redux/slices/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

const initialState = {
    userProfile: {},
    userComments: [],
    userFollowing: [],
    userFollowers: [],
    profileIsLoading: false,
    commentsIsLoading: false,
    followIsLoading: false,
    savedTopics: [],
    savedTopicsLoading: false,
    userUpvotedTopics: [],
    upvotedTopicsLoading: false,
};

export const toggleUserFollow = createAsyncThunk(
    "profile/toggleUserFollow",
    async (username, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/user/${username}/follow`);
            // backend returns updated current user (me)
            return { updatedCurrentUser: data, followedUsername: username };
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// FIXED: accept username parameter
export const getSavedTopics = createAsyncThunk(
    "profile/getSavedTopics",
    async (username, { rejectWithValue }) => {
        try {
            console.log("getSavedTopics", username);
            const { data } = await axios.get(`/api/user/${username}/saved-topics`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const getUserUpvotedTopics = createAsyncThunk(
    "profile/getUserUpvotedTopics",
    async (username, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/user/${username}/upvoted`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const getUserProfile = createAsyncThunk(
    "profile/getUserProfile",
    async (username, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/user/${username}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const getUserComments = createAsyncThunk(
    "profile/getUserComments",
    async (username, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/user/${username}/comments`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const getUserFollowing = createAsyncThunk(
    "profile/getUserFollowing",
    async (username, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/user/${username}/following`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const getUserFollowers = createAsyncThunk(
    "profile/getUserFollowers",
    async (username, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/user/${username}/followers`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        resetUserProfile: (state) => {
            state.userProfile = {};
            state.profileIsLoading = false;
        },
        resetUserComments: (state) => {
            state.userComments = [];
            state.commentsIsLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // GET PROFILE
            .addCase(getUserProfile.pending, (state) => {
                state.profileIsLoading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.profileIsLoading = false;
                state.userProfile = action.payload;
            })
            .addCase(getUserProfile.rejected, (state) => {
                state.profileIsLoading = false;
            })

            // TOGGLE FOLLOW (fix: update userProfile followers, not state.user)
            .addCase(toggleUserFollow.fulfilled, (state, action) => {
                const { followedUsername, updatedCurrentUser } = action.payload || {};
                // if we are viewing the profile of the person we just followed/unfollowed
                if (state.userProfile && state.userProfile.username === followedUsername) {
                    const myId = updatedCurrentUser?._id;
                    const isFollowing = updatedCurrentUser?.following?.includes(myId);

                    if (isFollowing) {
                        // add me to their followers (avoid duplicates)
                        if (!state.userProfile.followers) state.userProfile.followers = [];
                        if (!state.userProfile.followers.includes(myId)) {
                            state.userProfile.followers.push(myId);
                        }
                    } else {
                        state.userProfile.followers = (state.userProfile.followers || []).filter(
                            (id) => id !== myId
                        );
                    }
                }
            })

            // GET COMMENTS
            .addCase(getUserComments.pending, (state) => {
                state.commentsIsLoading = true;
            })
            .addCase(getUserComments.fulfilled, (state, action) => {
                state.commentsIsLoading = false;
                state.userComments = action.payload;
            })
            .addCase(getUserComments.rejected, (state) => {
                state.commentsIsLoading = false;
            })

            // GET FOLLOWING
            .addCase(getUserFollowing.pending, (state) => {
                state.followIsLoading = true;
            })
            .addCase(getUserFollowing.fulfilled, (state, action) => {
                state.followIsLoading = false;
                state.userFollowing = action.payload;
            })
            .addCase(getUserFollowing.rejected, (state) => {
                state.followIsLoading = false;
            })

            // GET FOLLOWERS
            .addCase(getUserFollowers.pending, (state) => {
                state.followIsLoading = true;
            })
            .addCase(getUserFollowers.fulfilled, (state, action) => {
                state.followIsLoading = false;
                state.userFollowers = action.payload;
            })
            .addCase(getUserFollowers.rejected, (state) => {
                state.followIsLoading = false;
            })

            // SAVED TOPICS
            .addCase(getSavedTopics.pending, (state) => {
                state.savedTopicsLoading = true;
            })
            .addCase(getSavedTopics.fulfilled, (state, action) => {
                state.savedTopicsLoading = false;
                state.savedTopics = action.payload;
            })
            .addCase(getSavedTopics.rejected, (state) => {
                state.savedTopicsLoading = false;
            })

            // UPVOTED TOPICS
            .addCase(getUserUpvotedTopics.pending, (state) => {
                state.upvotedTopicsLoading = true;
            })
            .addCase(getUserUpvotedTopics.fulfilled, (state, action) => {
                state.upvotedTopicsLoading = false;
                state.userUpvotedTopics = action.payload;
            })
            .addCase(getUserUpvotedTopics.rejected, (state) => {
                state.upvotedTopicsLoading = false;
            });
    },
});

export const { resetUserProfile, resetUserComments } = profileSlice.actions;
export default profileSlice.reducer;