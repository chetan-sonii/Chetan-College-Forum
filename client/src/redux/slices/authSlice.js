import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import { toggleUserFollow } from "./profileSlice"

const initialState = {
    user: null,
    token: null,
    isHeaderLoading: true,
    isLoggedIn: false,
    isLoading: false, // used by toggleUserFollow
    login: {
        message: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
    },
    register: {
        message: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
    },
    sendEmailVerify: {
        message: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
    },
    emailVerify: {
        message: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
    },
    forgotPassword: {
        message: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
    },
    resetPassword: {
        message: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
    },
    updateUserProfileState: {
        message: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
    },
};

const safeReject = (err) =>
    // ensure payload has a predictable shape (at least {message})
    err?.response?.data ?? { message: err?.message ?? "Network Error" };

export const login = createAsyncThunk(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post("/login", { email, password });
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.post("/logout");
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);

export const register = createAsyncThunk(
    "auth/register",
    async (
        { username, email, password, firstName, lastName },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await axios.post("/register", {
                username,
                email,
                password,
                firstName,
                lastName,
            });
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);

export const refresh_token = createAsyncThunk(
    "auth/refresh_token",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get("/refresh_token");
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    "user/updateUserProfile",
    async (obj, { rejectWithValue }) => {
        const { username } = obj;
        try {
            const { data } = await axios.put(`/api/user/${username}`, obj, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);



export const sendEmailVerification = createAsyncThunk(
    "auth/sendEmailVerification",
    async ({ email }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post("/send-email-verification", { email });
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);

export const emailVerify = createAsyncThunk(
    "auth/emailVerify",
    async ({ token }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post("/verify-email", { token });
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({ token, newPassword, confirmNewPassword }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post("/reset-password", {
                token,
                newPassword,
                confirmNewPassword,
            });
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);

export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async ({ email }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post("/forgot-password", { email });
            console.log(data);
return data;
        } catch (err) {
            return rejectWithValue(safeReject(err));
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetLogin: (state) => {
            state.login = { ...initialState.login };
        },
        resetRegister: (state) => {
            state.register = { ...initialState.register };
        },
        resetUpdateProfile: (state) => {
            state.updateUserProfileState = { ...initialState.updateUserProfileState };
        },
        resetVerifyEmail: (state) => {
            state.emailVerify = { ...initialState.emailVerify };
        },
    },
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(login.pending, (state) => {
                state.login.isLoading = true;
                state.token = null;
                state.login.isError = null;
                state.login.isSuccess = null;
                state.login.message = "Verifying...";
            })
            .addCase(login.fulfilled, (state, action) => {
                state.login.isLoading = false;
                state.token = action.payload?.token ?? null;
                state.user = action.payload?.user ?? state.user;
                state.isLoggedIn = true;
                localStorage.setItem("isLoggedIn", true);
                localStorage.setItem("user", JSON.stringify(action.payload?.user ?? {}));
                if (action.payload?.token) {
                    axios.defaults.headers.common[
                        "Authorization"
                        ] = `Bearer ${action.payload.token}`;
                }
                state.login.isError = false;
                state.login.isSuccess = true;
                state.login.message = action.payload?.message ?? "Logged in";
            })
            .addCase(login.rejected, (state, action) => {
                state.login.isLoading = false;
                state.token = null;
                state.isLoggedIn = false;
                state.login.isSuccess = false;
                state.login.isError = true;
                state.login.message =
                    action.payload?.message || action.error?.message || "Login failed";
            })

            // REGISTER
            .addCase(register.pending, (state) => {
                state.register.isLoading = true;
                state.register.isError = null;
                state.register.isSuccess = null;
                state.register.message = "Signing Up...";
            })
            .addCase(register.fulfilled, (state, action) => {
                state.register.isLoading = false;
                state.register.isError = false;
                state.register.isSuccess = true;
                state.register.message = action.payload?.message ?? "Signed up";
            })
            .addCase(register.rejected, (state, action) => {
                state.register.isLoading = false;
                state.register.isSuccess = false;
                state.register.isError = true;
                state.register.message =
                    action.payload?.message || action.error?.message || "Register failed";
            })

            // REFRESH
            .addCase(refresh_token.pending, (state) => {
                state.isHeaderLoading = true;
                state.token = null;
            })
            .addCase(refresh_token.fulfilled, (state, action) => {
                state.isHeaderLoading = false;
                state.token = action.payload?.token ?? null;
                state.user = action.payload?.user ?? state.user;
                state.isLoggedIn = true;
                localStorage.setItem("isLoggedIn", true);
                localStorage.setItem("user", JSON.stringify(action.payload?.user ?? {}));
                if (action.payload?.token) {
                    axios.defaults.headers.common[
                        "Authorization"
                        ] = `Bearer ${action.payload.token}`;
                }
            })
            .addCase(refresh_token.rejected, (state) => {
                state.isHeaderLoading = false;
                state.token = null;
                state.user = null;
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("user");
            })

            // LOGOUT
            .addCase(logout.pending, (state) => {
                state.isHeaderLoading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isHeaderLoading = false;
                state.token = null;
                state.user = {};
                state.isLoggedIn = false;
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("user");
                axios.defaults.headers.common["Authorization"] = "";
            })
            .addCase(logout.rejected, (state) => {
                state.isHeaderLoading = false;
                state.token = null;
            })

            // FOLLOW (Handled via import from profileSlice)
            .addCase(toggleUserFollow.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(toggleUserFollow.fulfilled, (state, action) => {
                // Update the logged-in user with the fresh data from backend
                state.user = action.payload.updatedCurrentUser;
                localStorage.setItem("user", JSON.stringify(action.payload.updatedCurrentUser));
            })
            .addCase(toggleUserFollow.rejected, (state) => {
                state.isLoading = false;
            })

            // UPDATE PROFILE
            .addCase(updateUserProfile.pending, (state) => {
                state.updateUserProfileState.isLoading = true;
                state.updateUserProfileState.isError = false;
                state.updateUserProfileState.isSuccess = false;
                state.updateUserProfileState.message = "Updating profile...";
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.updateUserProfileState.isLoading = false;
                state.updateUserProfileState.isError = false;
                state.updateUserProfileState.isSuccess = true;
                state.updateUserProfileState.message =
                    action.payload?.message ?? "Profile updated";
                state.user = action.payload?.updatedUser ?? state.user;
                localStorage.setItem("isLoggedIn", true);
                localStorage.setItem(
                    "user",
                    JSON.stringify(action.payload?.updatedUser ?? state.user)
                );
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.updateUserProfileState.isLoading = false;
                state.updateUserProfileState.isError = true;
                state.updateUserProfileState.isSuccess = false;
                state.updateUserProfileState.message =
                    action.payload?.message || action.error?.message || "Update failed";
            })

            // SEND EMAIL VERIFICATION
            .addCase(sendEmailVerification.pending, (state) => {
                state.sendEmailVerify.isLoading = true;
                state.sendEmailVerify.isError = false;
                state.sendEmailVerify.isSuccess = false;
                state.sendEmailVerify.message = "Sending an activation link...";
            })
            .addCase(sendEmailVerification.fulfilled, (state, action) => {
                state.sendEmailVerify.isLoading = false;
                state.sendEmailVerify.isError = false;
                state.sendEmailVerify.isSuccess = true;
                state.sendEmailVerify.message =
                    action.payload?.message ?? "Verification sent";
            })
            .addCase(sendEmailVerification.rejected, (state, action) => {
                state.sendEmailVerify.isLoading = false;
                state.sendEmailVerify.isError = true;
                state.sendEmailVerify.isSuccess = false;
                state.sendEmailVerify.message =
                    action.payload?.message || action.error?.message || "Send failed";
            })

            // EMAIL VERIFY
            .addCase(emailVerify.pending, (state) => {
                state.emailVerify.isLoading = true;
                state.emailVerify.isError = false;
                state.emailVerify.isSuccess = false;
                state.emailVerify.message = "Activating your account...";
            })
            .addCase(emailVerify.fulfilled, (state, action) => {
                state.emailVerify.isLoading = false;
                state.emailVerify.isError = false;
                state.emailVerify.isSuccess = true;
                state.emailVerify.message =
                    action.payload?.message ?? "Account activated";
            })
            .addCase(emailVerify.rejected, (state, action) => {
                state.emailVerify.isLoading = false;
                state.emailVerify.isError = true;
                state.emailVerify.isSuccess = false;
                state.emailVerify.message =
                    action.payload?.message || action.error?.message || "Verify failed";
            })

            // FORGOT PASSWORD
            .addCase(forgotPassword.pending, (state) => {
                state.forgotPassword.isLoading = true;
                state.forgotPassword.isError = false;
                state.forgotPassword.isSuccess = false;
                state.forgotPassword.message = "Sending a reset password email...";
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.forgotPassword.isLoading = false;
                state.forgotPassword.isError = false;
                state.forgotPassword.isSuccess = true;
                state.forgotPassword.message =
                    action.payload?.message ?? "Reset email sent";
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.forgotPassword.isLoading = false;
                state.forgotPassword.isError = true;
                state.forgotPassword.isSuccess = false;
                state.forgotPassword.message =
                    action.payload?.message || action.error?.message || "Failed";
            })

            // RESET PASSWORD
            .addCase(resetPassword.pending, (state) => {
                state.resetPassword.isLoading = true;
                state.resetPassword.isError = false;
                state.resetPassword.isSuccess = false;
                state.resetPassword.message = "Resetting Password...";
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.resetPassword.isLoading = false;
                state.resetPassword.isError = false;
                state.resetPassword.isSuccess = true;
                state.resetPassword.message =
                    action.payload?.message ?? "Password reset";
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.resetPassword.isLoading = false;
                state.resetPassword.isError = true;
                state.resetPassword.isSuccess = false;
                state.resetPassword.message =
                    action.payload?.message || action.error?.message || "Failed";
            });
    },
});

export const {
    resetLogin,
    resetRegister,
    resetUpdateProfile,
    resetVerifyEmail,
} = authSlice.actions;

export default authSlice.reducer;