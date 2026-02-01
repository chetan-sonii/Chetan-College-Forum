import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";



const attachToken = () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
};
// Helper to set token
const setAdminToken = (token) => {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        localStorage.setItem("adminToken", token);
    } else {
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("adminToken");
    }
};

export const adminLogin = createAsyncThunk(
    "admin/login",
    async (userData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post("/api/admin/login", userData);
            setAdminToken(data.access_token); // Set header immediately
            localStorage.setItem("adminInfo", JSON.stringify(data.admin));
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getAdminStats = createAsyncThunk(
    "admin/getStats",
    async (_, { rejectWithValue }) => {
        try {
            // Ensure token is attached (in case of page reload)
            const token = localStorage.getItem("adminToken");
            if(token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const { data } = await axios.get("/api/admin/stats");
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

// 1. Get Users Thunk
export const getAdminUsers = createAsyncThunk(
    "admin/getUsers",
    async (searchQuery = "", { rejectWithValue }) => {
        try {
            attachToken(); // ✅ Ensure token is attached before request
            const { data } = await axios.get(`/api/admin/users?search=${searchQuery}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

// 2. Manage User Thunk (Ban/Delete)
export const manageUser = createAsyncThunk(
    "admin/manageUser",
    async ({ id, action }, { rejectWithValue }) => {
        try {
            attachToken(); // ✅ Ensure token is attached
            const { data } = await axios.post(`/api/admin/users/${id}/manage`, { action });
            return data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        admin: JSON.parse(localStorage.getItem("adminInfo")) || null,
        token: localStorage.getItem("adminToken") || null,
        stats: null,
        isLoading: false,
        error: null,
        usersList: [],
        usersLoading: false,
    },
    reducers: {
        adminLogout: (state) => {
            state.admin = null;
            state.token = null;
            state.stats = null;
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminInfo");
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(adminLogin.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.admin = action.payload.admin;
                state.token = action.payload.access_token;
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message;
            })
            // Stats
            .addCase(getAdminStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })

            .addCase(getAdminUsers.pending, (state) => { state.usersLoading = true; })
            .addCase(getAdminUsers.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.usersList = action.payload;
            })

            // Manage User (Update Local State Optimistically)
            .addCase(manageUser.fulfilled, (state, action) => {
                const { userId, action: userAction } = action.payload;

                if (userAction === "delete") {
                    state.usersList = state.usersList.filter(u => u._id !== userId);
                } else if (userAction === "ban") {
                    const user = state.usersList.find(u => u._id === userId);
                    if (user) user.isBanned = true;
                } else if (userAction === "unban") {
                    const user = state.usersList.find(u => u._id === userId);
                    if (user) user.isBanned = false;
                }
            });
    },
});

export const { adminLogout } = adminSlice.actions;
export default adminSlice.reducer;