import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

const initialState = {
    topics: [],
    topic: {},
    topContributors: [],
    spaces: [],
    getSpacesLoading: false,
    searchQuery: "",
    sortOption: "latest",
    getAllTopicsIsLoading: false,
    getTopicIsLoading: false,
    votingIsLoading: false,
    topContributorsIsLoading: false,
    addTopic: {
        isLoading: false,
        isSuccess: false,
        isError: false,
        newTopicURL: null,
        message: null,
    },
    deleteTopicIsLoading: false,
    isSuccess: false,
    isError: false,
    message: null,
};

export const getAllTopics = createAsyncThunk(
    "topic/getAllTopics",
    // Accept an object containing search, sort, AND space
    async ({ search = "", sort = "latest", space = "" }, { rejectWithValue }) => {
        try {
            // Pass space to the API URL
            const { data } = await axios.get(
                `/api/topics?search=${search}&sort=${sort}&space=${space}`
            );
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getTopic = createAsyncThunk(
    "topic/getTopic",
    async ({ id, slug }, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/topics/${id}/${slug}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const addTopic = createAsyncThunk(
    "topic/addTopic",
    async (
        { title, content, selectedSpace, selectedTags },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await axios.post("/api/topics", {
                title,
                content,
                selectedSpace,
                selectedTags,
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const deleteTopic = createAsyncThunk(
    "topic/deleteTopic",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(`/api/topics/${id}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const toggleUpvoteTopic = createAsyncThunk(
    "topic/toggleUpvoteTopic",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`/api/topics/${id}/upvote`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const toggleDownvoteTopic = createAsyncThunk(
    "topic/toggleDownvoteTopic",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`/api/topics/${id}/downvote`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getTopContributors = createAsyncThunk(
    "topic/getTopContributors",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/topics/contributors`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getSpaces = createAsyncThunk(
    "topic/getSpaces",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/topics/spaces`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const topicSlice = createSlice({
    name: "topic",
    initialState,
    reducers: {
        resetTopics: (state) => {
            state.topics = [];
            state.topic = {};
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = null;
        },
        resetNewTopic: (state) => {
            state.addTopic = { ...initialState.addTopic };
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setSortOption: (state, action) => {
            state.sortOption = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // GET ALL TOPICS
            .addCase(getAllTopics.pending, (state) => {
                state.getAllTopicsIsLoading = true;
            })
            .addCase(getAllTopics.fulfilled, (state, action) => {
                state.getAllTopicsIsLoading = false;
                state.topics = action.payload;
            })
            .addCase(getAllTopics.rejected, (state) => {
                state.getAllTopicsIsLoading = false;
            })

            // GET SINGLE TOPIC
            .addCase(getTopic.pending, (state) => {
                state.getTopicIsLoading = true;
            })
            .addCase(getTopic.fulfilled, (state, action) => {
                state.getTopicIsLoading = false;
                state.topic = action.payload;
            })
            .addCase(getTopic.rejected, (state) => {
                state.getTopicIsLoading = false;
            })

            // ADD TOPIC
            .addCase(addTopic.pending, (state) => {
                state.addTopic.isLoading = true;
                state.addTopic.isSuccess = false;
                state.addTopic.isError = false;
                state.addTopic.message = "Adding new topic...";
            })
            .addCase(addTopic.fulfilled, (state, action) => {
                state.addTopic.isLoading = false;
                state.addTopic.isSuccess = true;
                state.addTopic.isError = false;
                state.topics.push(action.payload.topic);
                state.addTopic.message = action.payload.message;

                // ✅ FIX: Change TopicID to _id
                state.addTopic.newTopicURL = `/topics/${action.payload.topic._id}/${action.payload.topic.slug}`;
            })
            .addCase(addTopic.rejected, (state, action) => {
                state.addTopic.isLoading = false;
                state.addTopic.isSuccess = false;
                state.addTopic.isError = true;
                state.addTopic.message = action.payload.message;
            })

            //  handle getusertopics

            .addCase(getUserTopics.pending, (state) => {
                state.getAllTopicsIsLoading = true;
            })
            .addCase(getUserTopics.fulfilled, (state, action) => {
                state.getAllTopicsIsLoading = false;
                state.topics = action.payload; // Updates the main topics list
            })
            .addCase(getUserTopics.rejected, (state) => {
                state.getAllTopicsIsLoading = false;
            })


            // TOGGLE UPVOTE
            .addCase(toggleUpvoteTopic.pending, (state) => {
                state.votingIsLoading = true;
            })
            .addCase(toggleUpvoteTopic.fulfilled, (state, action) => {
                state.votingIsLoading = false;

                const updateVote = (item) => {
                    if (item._id === action.payload.topicId) {
                        if (item.upvotes.includes(action.payload.username)) {
                            item.upvotes = item.upvotes.filter(
                                (id) => id !== action.payload.username
                            );
                        } else {
                            item.upvotes.push(action.payload.username);
                            item.downvotes = item.downvotes.filter(
                                (id) => id !== action.payload.username
                            );
                        }
                    }
                };

                // Update single topic view if active
                if (state.topic && Object.keys(state.topic).length > 0) {
                    updateVote(state.topic);
                }

                // Update topic in list view (Fixes map bug by finding and mutating)
                const listTopic = state.topics.find(
                    (t) => t._id === action.payload.topicId
                );
                if (listTopic) {
                    updateVote(listTopic);
                }
            })
            .addCase(toggleUpvoteTopic.rejected, (state) => {
                state.votingIsLoading = false;
            })

            // TOGGLE DOWNVOTE
            .addCase(toggleDownvoteTopic.pending, (state) => {
                state.votingIsLoading = true;
            })
            .addCase(toggleDownvoteTopic.fulfilled, (state, action) => {
                state.votingIsLoading = false;

                const updateVote = (item) => {
                    if (item._id === action.payload.topicId) {
                        if (item.downvotes.includes(action.payload.username)) {
                            item.downvotes = item.downvotes.filter(
                                (id) => id !== action.payload.username
                            );
                        } else {
                            item.downvotes.push(action.payload.username);
                            item.upvotes = item.upvotes.filter(
                                (id) => id !== action.payload.username
                            );
                        }
                    }
                };

                // Update single topic view if active
                if (state.topic && Object.keys(state.topic).length > 0) {
                    updateVote(state.topic);
                }

                // Update topic in list view
                const listTopic = state.topics.find(
                    (t) => t._id === action.payload.topicId
                );
                if (listTopic) {
                    updateVote(listTopic);
                }
            })
            .addCase(toggleDownvoteTopic.rejected, (state) => {
                state.votingIsLoading = false;
            })

            // DELETE TOPIC
            .addCase(deleteTopic.pending, (state) => {
                state.deleteTopicIsLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = "Deleting topic...";
            })
            .addCase(deleteTopic.fulfilled, (state, action) => {
                state.deleteTopicIsLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.topic = {};
                state.topics = state.topics.filter(
                    (t) => t._id !== action.payload.topicId
                );
                state.message = action.payload.message;
            })
            .addCase(deleteTopic.rejected, (state, action) => {
                state.deleteTopicIsLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload.message;
            })

            // GET CONTRIBUTORS & SPACES
            .addCase(getTopContributors.pending, (state) => {
                state.topContributorsIsLoading = true;
            })
            .addCase(getTopContributors.fulfilled, (state, action) => {
                state.topContributorsIsLoading = false;
                state.topContributors = action.payload;
            })
            .addCase(getTopContributors.rejected, (state) => {
                state.topContributorsIsLoading = false;
            })
            .addCase(getSpaces.pending, (state) => {
                state.getSpacesLoading = true;
            })
            .addCase(getSpaces.fulfilled, (state, action) => {
                state.getSpacesLoading = false;
                state.spaces = action.payload;
            })
            .addCase(getSpaces.rejected, (state) => {
                state.getSpacesLoading = false;
            });
    },
});
export const getUserTopics = createAsyncThunk(
    "topic/getUserTopics",
    async (username, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/user/${username}/topics`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);
export const { resetTopics, resetNewTopic, setSearchQuery, setSortOption } =
    topicSlice.actions;

export default topicSlice.reducer;