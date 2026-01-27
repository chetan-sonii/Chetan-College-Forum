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

export const getUserProfile = createAsyncThunk(
    "profile/getUserProfile",
    async (username, { rejectWithValue }) => {
      try {
        const { data } = await axios.get(`/api/user/${username}`);
        return data;
      } catch (err) {
        console.log(err.message);
        return rejectWithValue(err.message);
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
        });
  },
});


export const { resetUserProfile, resetUserComments } = profileSlice.actions;

export default profileSlice.reducer;