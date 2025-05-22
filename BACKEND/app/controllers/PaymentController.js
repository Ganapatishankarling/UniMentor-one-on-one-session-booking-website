import { validationResult } from 'express-validator';
import PaymentModel from '../models/PaymentModel.js';
import Session from '../models/SessionModel.js';


const paymentController = {};

paymentController.list = async (req, res) => {
    try {
        const filter = {};
        if (req.query.mentorId) filter.mentorId = req.query.mentorId;
        if (req.query.studentId) filter.studentId = req.query.studentId;
        if (req.query.sessionId) filter.sessionId = req.query.sessionId;
        const payments = await PaymentModel.find(filter).sort({ createdAt: -1 });
        return res.json(payments);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};



paymentController.create = async (req, res) => {
    const { sessionId, mentorId, studentId, amount, currency, paymentMethod, paymentStatus, transactionId } = req.body;
    try {
        const payment = new PaymentModel({
            sessionId,
            mentorId,
            studentId,
            amount,
            currency,
            paymentMethod,
            paymentStatus,
            transactionId
        });

        await payment.save();

        return res.status(201).json({ message: 'Payment created successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};


paymentController.updateStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    const { paymentStatus } = req.body;
    try {
        const payment = await PaymentModel.findByIdAndUpdate(id, { paymentStatus }, { new: true });

        if (!payment) {
            return res.status(404).json({ errors: 'Payment not found' });
        }

        return res.json(payment);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};


paymentController.delete = async (req, res) => {
    const id  = req.params.id;
    try {
        const payment = await PaymentModel.findByIdAndDelete(id);

        if (!payment) {
            return res.status(404).json({ errors: 'Payment not found' });
        }

        return res.json(payment);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ errors: 'Something went wrong' });
    }
};


export default paymentController;
