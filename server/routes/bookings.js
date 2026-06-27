const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Mock payment helper
const simulatePayment = () => {
  return Math.random() > 0.1; // 90% success rate
};

// Create booking
router.post('/', async (req, res) => {
  try {
    const { userId, eventId, paymentMethod, amount } = req.body;
    
    // Check if event exists and has capacity
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Simulate Payment
    const isPaymentSuccessful = simulatePayment();
    
    const newBooking = new Booking({
      user: userId,
      event: eventId,
      amount,
      paymentMethod,
      paymentStatus: isPaymentSuccessful ? 'completed' : 'failed',
      transactionId: isPaymentSuccessful ? 'TXN' + Date.now() : null
    });

    await newBooking.save();

    if (isPaymentSuccessful) {
      // Add user to event registrations
      event.registrations.push(userId);
      await event.save();
      res.status(201).json({ message: 'Booking successful', booking: newBooking });
    } else {
      res.status(400).json({ message: 'Payment failed', booking: newBooking });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).populate('event');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
