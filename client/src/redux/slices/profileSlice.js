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
};

// ✅ DEFINE THE THUNK HERE
export const toggleUserFollow = createAsyncThunk(
    "profile/toggleUserFollow",
    async (username, { rejectWithValue }) => {
        try {
            // The backend returns the UPDATED CURRENT USER (me)
            const { data } = await axios.put(`/api/user/${username}/follow`);
            return { updatedCurrentUser: data, followedUsername: username };
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
            return rejectWithValue(err.response.data);
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
        console.log(err.message);
        return rejectWithValue(err.message);
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
        console.log(err.message);
        return rejectWithValue(err.message);
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
        console.log(err.message);
        return rejectWithValue(err.message);
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
        .addCase(toggleUserFollow.fulfilled, (state, action) => {
            // If we are viewing the profile of the person we just followed/unfollowed
            if (state.user && state.user.username === action.payload.followedUsername) {
                const myId = action.payload.updatedCurrentUser._id;
                const isFollowing = action.payload.updatedCurrentUser.following.includes(state.user._id);

                if (isFollowing) {
                    // Add me to their followers list
                    state.user.followers.push(myId);
                } else {
                    // Remove me from their followers list
                    state.user.followers = state.user.followers.filter(id => id !== myId);
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

  },
});


export const { resetUserProfile, resetUserComments } = profileSlice.actions;

export default profileSlice.reducer;