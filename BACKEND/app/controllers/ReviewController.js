import {validationResult} from 'express-validator'
import ReviewModel from '../models/ReviewModel.js'
import Session from '../models/SessionModel.js'

const reviewController = {}

reviewController.list = async (req, res) => {
    try {
        const { mentorId, studentId, sessionId } = req.query;
        const filter = { ...(mentorId && { mentorId }), ...(studentId && { studentId }), ...(sessionId && { sessionId }) };

        const reviews = await ReviewModel.find(filter).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

reviewController.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    } 
    const { sessionId, mentorId, studentId, rating, comment } = req.body;

    try {
        const review = new ReviewModel({ sessionId, mentorId, studentId, rating, comment });
        await review.save();

        res.status(201).json({ message: 'Review created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

reviewController.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    const id = req.params.id
    const {rating,comment} = req.body
    try {
        const updatedFields = {};
        if (rating !== undefined) updatedFields.rating = rating;
        if (comment !== undefined) updatedFields.comment = comment;

        const review = await ReviewModel.findByIdAndUpdate(id, updatedFields, { new: true });
        if (!review) return res.status(404).json({ error: 'Review not found' });

        res.json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

reviewController.delete = async (req, res) => {
    const id = req.params.id
    try {
        const review = await ReviewModel.findByIdAndDelete(id);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        res.json({ message: 'Review deleted successfully', review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export default reviewController;


