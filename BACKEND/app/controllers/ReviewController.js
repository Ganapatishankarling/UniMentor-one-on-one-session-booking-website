import { validationResult } from 'express-validator';
import ReviewModel from '../models/ReviewModel.js';

const reviewController = {};

// List reviews with optional filters
reviewController.list = async (req, res) => {
    try {
        const { mentorId, studentId } = req.query;
        const filter = {};
        
        if (mentorId) filter.mentorId = mentorId;
        if (studentId) filter.studentId = studentId;
        
        const reviews = await ReviewModel.find(filter).sort({ createdAt: -1 });
        return res.status(200).json(reviews);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Create a new review
reviewController.create = async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        } 
    try {
        
        const review = new ReviewModel({
            mentorId: req.params.id,
            studentId: req.body.studentId,
            rating: req.body.rating,
            comment: req.body.comment
        });
        
        await review.save();
        return res.status(201).json(review);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to create review' });
    }
};

// Update a review
reviewController.update = async (req, res) => {
     const errors = validationResult(req);
        if (!errors.isEmpty()){
             return res.status(400).json({ errors: errors.array() });
        }
        
    try {
       
        const updatedReview = await ReviewModel.findByIdAndUpdate(
            req.params.id,
            { rating: req.body.rating, comment: req.body.comment },
            { new: true, runValidators: true }
        );
        
        if (!updatedReview) return res.status(404).json({ error: 'Review not found' });
        return res.status(200).json(updatedReview);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update review' });
    }
};

// Delete a review
reviewController.delete = async (req, res) => {
    try {
        const deletedReview = await ReviewModel.findByIdAndDelete(req.params.id);
        if (!deletedReview) return res.status(404).json({ error: 'Review not found' });
        return res.status(200).json({ message: 'Review deleted' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to delete review' });
    }
};

export default reviewController;