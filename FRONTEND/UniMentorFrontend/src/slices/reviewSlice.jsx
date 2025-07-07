import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../config/axios.jsx'

// Async thunks for review operations
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (filters = {}, thunkAPI) => {
    try {
      const response = await axios.get('/api/reviews', { 
        params: filters,
        headers: { Authorization: localStorage.getItem('token') }
      });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchReviewById = createAsyncThunk(
  'reviews/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async (reviewData, thunkAPI) => {
    try {
      const response = await axios.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, reviewData }, thunkAPI) => {
    try {
      const response = await axios.put(`/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`/api/reviews/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getReviewStats = createAsyncThunk(
  'reviews/stats',
  async (mentorId, thunkAPI) => {
    try {
      const response = await axios.get(`/api/reviews/stats/${mentorId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  reviews: [],
  currentReview: null,
  stats: {
    averageRating: null,
    totalReviews: 0
  },
  isLoading: false,
  error: null,
  successMessage: null
};

// Create the slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewErrors: (state) => {
      state.error = null;
    },
    clearReviewSuccess: (state) => {
      state.successMessage = null;
    },
    resetReviewState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reviews
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
        state.error = null;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch reviews';
      })
      
      // Fetch review by ID
      .addCase(fetchReviewById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReview = action.payload;
        state.error = null;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch review';
      })
      
      // Create review
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews.push(action.payload);
        state.successMessage = 'Review submitted successfully';
        state.error = null;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create review';
      })
      
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reviews.findIndex(review => review._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        if (state.currentReview && state.currentReview._id === action.payload._id) {
          state.currentReview = action.payload;
        }
        state.successMessage = 'Review updated successfully';
        state.error = null;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update review';
      })
      
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.filter(review => review._id !== action.payload);
        if (state.currentReview && state.currentReview._id === action.payload) {
          state.currentReview = null;
        }
        state.successMessage = 'Review deleted successfully';
        state.error = null;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete review';
      })
      
      // Get review stats
      .addCase(getReviewStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviewStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getReviewStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch review statistics';
      });
  }
});

export const { clearReviewErrors, clearReviewSuccess, resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;