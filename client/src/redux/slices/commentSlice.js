import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

const initialState = {
    comments: [],
    getTopicCommentsState: {
        isLoading: false,
        isSuccess: false,
        isError: false,
        message: null,
    },
    topHelpers: [],
    herlpersIsLoading: false,
    votingIsLoading: false,
    deleteCommentLoading: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: null,
};

export const getTopicComments = createAsyncThunk(
    "comment/getTopicComments",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/comments/${id}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const deleteComment = createAsyncThunk(
    "comment/deleteComment",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(`/api/comments/${id}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const addComment = createAsyncThunk(
    "comment/addComment",
    async ({ id, comment, parentComment }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`/api/comments/`, {
                id,
                comment,
                parentComment,
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const toggleUpvoteComment = createAsyncThunk(
    "comment/toggleUpvoteComment",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`/api/comments/${id}/upvote`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const toggleDownvoteComment = createAsyncThunk(
    "comment/toggleDownvoteComment",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`/api/comments/${id}/downvote`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getTopHelpers = createAsyncThunk(
    "comment/getTopHelpers",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/comments/helpers`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {
        // NEW: Real-time update reducer
        addRealTimeComment: (state, action) => {
            const exists = state.comments.find(
                (c) => c._id === action.payload._id
            );
            if (!exists) {
                state.comments.push(action.payload);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTopicComments.pending, (state) => {
                state.getTopicCommentsState.isLoading = true;
            })
            .addCase(getTopicComments.fulfilled, (state, action) => {
                state.getTopicCommentsState.isLoading = false;
                state.comments = action.payload.comments;
            })
            .addCase(getTopicComments.rejected, (state) => {
                state.getTopicCommentsState.isLoading = false;
            })
            .addCase(addComment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.isLoading = false;
                // ✅ FIX: Check for duplicate before pushing
                const exists = state.comments.find(
                    (c) => c._id === action.payload.comment._id
                );
                if (!exists) {
                    state.comments.push(action.payload.comment);
                }
            })
            .addCase(addComment.rejected, (state) => {
                state.isLoading = false;
            })

            .addCase(toggleUpvoteComment.pending, (state) => {
                state.votingIsLoading = true;
            })
            .addCase(toggleUpvoteComment.fulfilled, (state, action) => {
                state.votingIsLoading = false;
                const comment = state.comments.find(
                    (c) => c._id === action.payload.commentId
                );
                if (comment) {
                    if (comment.upvotes.includes(action.payload.username)) {
                        comment.upvotes = comment.upvotes.filter(
                            (id) => id !== action.payload.username
                        );
                    } else {
                        comment.upvotes.push(action.payload.username);
                        comment.downvotes = comment.downvotes.filter(
                            (id) => id !== action.payload.username
                        );
                    }
                }
            })
            .addCase(toggleUpvoteComment.rejected, (state) => {
                state.votingIsLoading = false;
            })
            .addCase(toggleDownvoteComment.pending, (state) => {
                state.votingIsLoading = true;
            })
            .addCase(toggleDownvoteComment.fulfilled, (state, action) => {
                state.votingIsLoading = false;
                const comment = state.comments.find(
                    (c) => c._id === action.payload.commentId
                );
                if (comment) {
                    if (comment.downvotes.includes(action.payload.username)) {
                        comment.downvotes = comment.downvotes.filter(
                            (id) => id !== action.payload.username
                        );
                    } else {
                        comment.downvotes.push(action.payload.username);
                        comment.upvotes = comment.upvotes.filter(
                            (id) => id !== action.payload.username
                        );
                    }
                }
            })
            .addCase(toggleDownvoteComment.rejected, (state) => {
                state.votingIsLoading = false;
            })
            .addCase(deleteComment.pending, (state) => {
                state.deleteCommentLoading = true;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.deleteCommentLoading = false;
                state.comments = state.comments.filter(
                    (comment) => !action.payload.deletedComments.includes(comment._id)
                );
            })
            .addCase(deleteComment.rejected, (state) => {
                state.deleteCommentLoading = false;
            })
            .addCase(getTopHelpers.pending, (state) => {
                state.herlpersIsLoading = true;
            })
            .addCase(getTopHelpers.fulfilled, (state, action) => {
                state.herlpersIsLoading = false;
                state.topHelpers = action.payload;
            })
            .addCase(getTopHelpers.rejected, (state) => {
                state.herlpersIsLoading = false;
            });
    },
});

export const { addRealTimeComment } = commentSlice.actions;
export default commentSlice.reducer;