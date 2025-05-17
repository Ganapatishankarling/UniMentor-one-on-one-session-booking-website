import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from '../config/axios.jsx'

export const fetchSessions = createAsyncThunk('/sessions/fetchSessions',async(filters={},ThunkAPI)=>{
    try{
        const response = await axios.get('list-sessions',{params:filters,headers:{Authorization:localStorage.getItem('token')}})
        return response.data
    }catch(err){
        return ThunkAPI.rejectWithValue(err.response.data)
    }
})

export const fetchSessionById = createAsyncThunk(
    'sessions/fetchById',
    async (id, thunkAPI) => {
      try {
        const response = await axios.get(`session/${id}`);
        return response.data;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
      }
    }
  );
  
  export const createSession = createAsyncThunk(
    'sessions/create',
    async (sessionData, thunkAPI) => {
      try {
        const response = await axios.post('/add-session',sessionData);
        return response.data;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
      }
    }
  );
  
  export const updateSession = createAsyncThunk(
    'sessions/update',
    async ({ id, sessionData }, thunkAPI) => {
      try {
        const response = await axios.put(`/update-Session/${id}`, sessionData);
        return response.data;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
      }
    }
  );
  
  export const updateSessionStatus = createAsyncThunk(
    'sessions/updateStatus',
    async ({ id, status }, thunkAPI) => {
      try {
        const response = await axios.patch(`/update-session/${id}/status`, { status });
        return response.data;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
      }
    }
  );
  
  export const deleteSession = createAsyncThunk(
    'sessions/delete',
    async (id, thunkAPI) => {
      try {
        await axios.delete(`/session/${id}`);
        return id;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
      }
    }
  );

const initialState = {
    sessions: [],
    currentSession: null,
    isLoading: false,
    error: null,
    successMessage: null,
    mentorSessions: [],
    studentSessions: []
  };
  
  // Create the slice
  const sessionSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
      clearSessionErrors: (state) => {
        state.error = null;
      },
      clearSessionSuccess: (state) => {
        state.successMessage = null;
      },
      resetSessionState: () => initialState
    },
    extraReducers: (builder) => {
      builder
        // Fetch all sessions
        .addCase(fetchSessions.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(fetchSessions.fulfilled, (state, action) => {
          state.isLoading = false;
          state.sessions = action.payload;
          state.error = null;
        })
        .addCase(fetchSessions.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to fetch sessions';
        })
        
        // Fetch session by ID
        .addCase(fetchSessionById.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(fetchSessionById.fulfilled, (state, action) => {
          state.isLoading = false;
          state.currentSession = action.payload;
          state.error = null;
        })
        .addCase(fetchSessionById.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to fetch session';
        })
        
        .addCase(createSession.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(createSession.fulfilled, (state, action) => {
          state.isLoading = false;
          state.sessions.push(action.payload);
          state.successMessage = 'Session created successfully';
          state.error = null;
        })
        .addCase(createSession.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to create session';
        })
        
        .addCase(updateSession.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(updateSession.fulfilled, (state, action) => {
          state.isLoading = false;
          const index = state.sessions.findIndex(session => session._id === action.payload._id);
          if (index !== -1) {
            state.sessions[index] = action.payload;
          }
          if (state.currentSession && state.currentSession._id === action.payload._id) {
            state.currentSession = action.payload;
          }
          state.successMessage = 'Session updated successfully';
          state.error = null;
        })
        .addCase(updateSession.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to update session';
        })
        
        .addCase(updateSessionStatus.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(updateSessionStatus.fulfilled, (state, action) => {
          state.isLoading = false;
          const index = state.sessions.findIndex(session => session._id === action.payload._id);
          if (index !== -1) {
            state.sessions[index].status = action.payload.status;
          }
          if (state.currentSession && state.currentSession._id === action.payload._id) {
            state.currentSession.status = action.payload.status;
          }
          state.successMessage = `Session status updated to ${action.payload.status}`;
          state.error = null;
        })
        .addCase(updateSessionStatus.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to update session status';
        })
        
        .addCase(deleteSession.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(deleteSession.fulfilled, (state, action) => {
          state.isLoading = false;
          state.sessions = state.sessions.filter(session => session._id !== action.payload);
          if (state.currentSession && state.currentSession._id === action.payload) {
            state.currentSession = null;
          }
          state.successMessage = 'Session deleted successfully';
          state.error = null;
        })
        .addCase(deleteSession.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to delete session';
        });
    }
  });
  
  export const { clearSessionErrors, clearSessionSuccess, resetSessionState } = sessionSlice.actions;
  export default sessionSlice.reducer