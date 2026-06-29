const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory mock data (will reset on every function cold start)
const MOCK_USERS = [
    { id: 1, name: 'Saranya Chowdary', email: 'saranya@nexus.edu', role: 'admin', dept: 'IT Dept', xp: 0 },
    { id: 2, name: 'Rahul Sharma', email: 'rahul@nexus.edu', role: 'user', dept: 'CS Dept', xp: 200 },
    { id: 3, name: 'Priya Verma', email: 'priya@nexus.edu', role: 'user', dept: 'Fine Arts', xp: 150 },
    { id: 4, name: 'Amit Patel', email: 'amit@nexus.edu', role: 'user', dept: 'Engineering', xp: 300 },
    { id: 5, name: 'Neha Gupta', email: 'neha@nexus.edu', role: 'user', dept: 'Commerce', xp: 100 },
    { id: 6, name: 'Vikram Singh', email: 'vikram@nexus.edu', role: 'user', dept: 'Physics', xp: 250 },
    { id: 7, name: 'Ananya Reddy', email: 'ananya@nexus.edu', role: 'user', dept: 'Biology', xp: 175 }
];

let events = [
    { id: 1, _id: 1, title: "AI & Machine Learning Workshop", category: "Computer Science", description: "Hands-on deep learning with TensorFlow and PyTorch.", price: 750, date: "2026-07-15", location: "CS Lab 4", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800", capacity: 50, registrations: 12 },
    { id: 2, _id: 2, title: "Annual Robotics Challenge", category: "Engineering", description: "Build and battle bots in a live arena.", price: 900, date: "2026-07-18", location: "Main Auditorium", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 85 },
    { id: 3, _id: 3, title: "Creative Arts Exhibition", category: "Fine Arts", description: "Student art showcase and live painting.", price: 450, date: "2026-07-20", location: "Arts Gallery", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800", capacity: 150, registrations: 120 },
    { id: 4, _id: 4, title: "Quantum Physics Symposium", category: "Physics", description: "Expert talks on quantum mechanics and entanglement.", price: 600, date: "2026-07-22", location: "Main Auditorium", imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800", capacity: 80, registrations: 30 },
    { id: 5, _id: 5, title: "Global Business Strategy", category: "Commerce", description: "Case study competition with industry leaders.", price: 850, date: "2026-07-25", location: "Main Auditorium", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800", capacity: 50, registrations: 49 },
    { id: 6, _id: 6, title: "Bio-Tech Innovation Fair", category: "Biology", description: "Future of CRISPR and gene editing.", price: 950, date: "2026-07-28", location: "Bio-Tech Wing", imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800", capacity: 120, registrations: 40 },
    { id: 7, _id: 7, title: "Literature & Poetry Slam", category: "English", description: "Spoken word night under the stars.", price: 300, date: "2026-07-30", location: "Arts Gallery", imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800", capacity: 300, registrations: 150 },
    { id: 8, _id: 8, title: "Cyber Security: CTF", category: "IT Dept", description: "Capture the flag ethical hacking challenge.", price: 700, date: "2026-08-02", location: "CS Lab 1", imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800", capacity: 60, registrations: 35 },
    { id: 9, _id: 9, title: "Inter-Dept Football Cup", category: "Sports", description: "University-wide football tournament.", price: 250, date: "2026-08-05", location: "University Stadium", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800", capacity: 1000, registrations: 450 },
    { id: 10, _id: 10, title: "Jazz & Blues Night", category: "Music", description: "Live music evening with guest performers.", price: 500, date: "2026-08-08", location: "Main Auditorium", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800", capacity: 200, registrations: 180 },
    { id: 11, _id: 11, title: "Tree Plantation Drive", category: "Environment", description: "Greening the campus, one tree at a time.", price: 200, date: "2026-08-12", location: "University Stadium", imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800", capacity: 1000, registrations: 800 },
    { id: 12, _id: 12, title: "Esports Championship", category: "Gaming", description: "Valorant & FIFA inter-college tourney.", price: 600, date: "2026-08-15", location: "CS Lab 1", imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800", capacity: 64, registrations: 60 },
    { id: 13, _id: 13, title: "Eco-Friendly Runway", category: "Fashion", description: "Recycled materials fashion show.", price: 900, date: "2026-08-18", location: "Arts Gallery", imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800", capacity: 500, registrations: 120 },
    { id: 14, _id: 14, title: "Calculus Competition", category: "Math", description: "Olympiad-level mathematics challenge.", price: 400, date: "2026-08-20", location: "Main Auditorium", imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 98 },
    { id: 15, _id: 15, title: "Nexus Grand Hackathon 2026", category: "Computer Science", description: "A 36-hour non-stop code-a-thon to build innovative solutions for campus sustainability.", price: 200, date: "2026-07-26", location: "CS Seminar Hall", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800", capacity: 150, registrations: 45 },
    { id: 16, _id: 16, title: "Nexus Battle of the Bands", category: "Music", description: "Watch top student bands compete live for the grand championship trophy.", price: 150, date: "2026-08-01", location: "Main Open Auditorium", imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=800", capacity: 800, registrations: 240 },
    { id: 17, _id: 17, title: "Inter-College Sports Gala", category: "Sports", description: "Annual sports tournament featuring basketball, volleyball, and badminton.", price: 100, date: "2026-08-04", location: "Sports Arena", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800", capacity: 500, registrations: 110 },
    { id: 18, _id: 18, title: "Starlight Fashion Runway", category: "Fashion", description: "Annual fashion showcase exhibiting designs crafted by student designers.", price: 250, date: "2026-08-10", location: "Arts Gallery Hall", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800", capacity: 300, registrations: 75 }
];

let bookings = [];
let waitlist = [];
let userInterests = {}; // userId -> interests array

// --- EVENTS ---
app.get('/api/events', (req, res) => res.json(events));
app.get('/api/events/:id', (req, res) => {
    const e = events.find(ev => String(ev.id) === String(req.params.id));
    e ? res.json(e) : res.status(404).json({ message: 'Event not found' });
});

// --- ADMIN: UPDATE CAPACITY ---
app.patch('/api/events/:id/capacity', (req, res) => {
    const event = events.find(e => String(e.id) === String(req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const newCap = req.body.capacity;
    if (newCap < event.registrations) return res.status(400).json({ message: 'Cannot reduce below current registrations' });
    event.capacity = newCap;
    res.json({ success: true, event });
});

// --- BOOKINGS ---
app.post('/api/bookings', (req, res) => {
    const event = events.find(e => String(e.id) === String(req.body.eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.registrations >= event.capacity) return res.status(400).json({ message: 'Event is full. Please join the waitlist.' });
    event.registrations++;
    const b = { id: Math.floor(Math.random()*9000)+1000, ...req.body, event, paidAmount: event.price, status: 'Confirmed', timestamp: new Date().toISOString() };
    bookings.push(b);
    res.json({ booking: b });
});
app.get('/api/bookings/user/:userId', (req, res) => res.json(bookings.filter(b => String(b.userId) === String(req.params.userId))));

// --- CANCEL ---
app.post('/api/bookings/:id/cancel', (req, res) => {
    const idx = bookings.findIndex(b => String(b.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Not found' });

    const booking = bookings[idx];
    bookings[idx].status = 'Cancelled';

    const eventId = booking.eventId || booking.event?.id;
    const event = events.find(e => String(e.id) === String(eventId));
    if (event) {
        event.registrations = Math.max(0, event.registrations - 1);
        const nextInLine = waitlist.find(w => String(w.eventId) === String(eventId) && w.status === 'waiting');
        if (nextInLine) {
            nextInLine.status = 'promoted';
            nextInLine.promotedAt = new Date().toISOString();
            nextInLine.expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        }
    }
    res.json({ success: true, message: 'Booking cancelled. Waitlist notified.' });
});

// --- WAITLIST ---
app.post('/api/waitlist/join', (req, res) => {
    const already = waitlist.find(w => String(w.eventId) === String(req.body.eventId) && String(w.userId) === String(req.body.userId) && w.status === 'waiting');
    if (already) return res.json({ position: waitlist.filter(w => String(w.eventId) === String(req.body.eventId) && w.status === 'waiting').indexOf(already) + 1 });
    
    const entry = { id: Date.now(), ...req.body, status: 'waiting', joinedAt: new Date().toISOString() };
    waitlist.push(entry);
    const position = waitlist.filter(w => String(w.eventId) === String(req.body.eventId) && w.status === 'waiting').length;
    res.json({ success: true, position });
});

app.get('/api/waitlist/event/:eventId', (req, res) => {
    res.json(waitlist.filter(w => String(w.eventId) === String(req.params.eventId)));
});

app.get('/api/waitlist/user/:userId', (req, res) => {
    res.json(waitlist.filter(w => String(w.userId) === String(req.params.userId)));
});

app.post('/api/waitlist/:id/claim', (req, res) => {
    const entry = waitlist.find(w => String(w.id) === String(req.params.id) && w.status === 'promoted');
    if (!entry) return res.status(404).json({ message: 'No promoted slot found' });
    if (new Date() > new Date(entry.expiresAt)) {
        entry.status = 'expired';
        return res.status(400).json({ message: 'Your 10-minute window has expired.' });
    }
    entry.status = 'claimed';
    const event = events.find(e => String(e.id) === String(entry.eventId));
    if (event) event.registrations++;
    const b = { id: Math.floor(Math.random()*9000)+1000, userId: entry.userId, eventId: entry.eventId, event, paidAmount: event?.price || 0, status: 'Confirmed', timestamp: new Date().toISOString(), source: 'waitlist' };
    bookings.push(b);
    res.json({ success: true, booking: b });
});

// --- ADMIN USERS & REPORTS ---
app.get('/api/admin/users', (req, res) => res.json(MOCK_USERS));
app.get('/api/admin/report', (req, res) => {
    res.json({
        generatedAt: new Date().toLocaleString(),
        stats: { totalUsers: MOCK_USERS.length, totalBookings: bookings.length, revenue: bookings.filter(b => b.status !== 'Refunded').reduce((s, b) => s + (b.paidAmount || 0), 0) },
        allBookings: bookings
    });
});

// --- AUTH ---
app.post('/api/auth/login', (req, res) => {
    const user = MOCK_USERS.find(u => u.email === req.body.email) || MOCK_USERS[0];
    res.json({ user, token: "tk" });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, role, dept } = req.body;
    const newUser = {
        id: MOCK_USERS.length + 1,
        name: name || 'New User',
        email: email || 'user@nexus.edu',
        role: role || (email?.includes('admin') ? 'admin' : 'user'),
        dept: dept || 'CS Dept',
        xp: 0
    };
    MOCK_USERS.push(newUser);
    res.status(201).json({ user: newUser, token: "tk" });
});

// --- INTERESTS & RECOMMENDATIONS ---
app.get('/api/users/:userId/interests', (req, res) => {
    const userId = req.params.userId;
    res.json(userInterests[userId] || []);
});

app.post('/api/users/:userId/interests', (req, res) => {
    const userId = req.params.userId;
    userInterests[userId] = req.body.interests || [];
    res.json({ success: true, interests: userInterests[userId] });
});

app.post('/api/users/:userId/interactions', (req, res) => {
    res.json({ success: true });
});

app.get('/api/users/:userId/recommendations', (req, res) => {
    res.json(events.slice(0, 3).map(e => ({
        ...e,
        matchPercentage: 95,
        matchReason: 'Recommended based on your academic interests'
    })));
});

// --- AI CHATBOT ---
app.post('/api/chat', (req, res) => {
    res.json({ response: "🤖 Hello from EventNexus AI! Ask me about active events or platform policies." });
});

// --- FORECAST & INSIGHTS & PREDICTIONS ---
app.get('/api/admin/events/predictions', (req, res) => {
    res.json(events.map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        date: e.date,
        registrations: e.registrations,
        capacity: e.capacity,
        predictedTurnout: Math.round(e.registrations * 1.1),
        confidence: "High (89%)",
        suggestion: e.registrations >= e.capacity ? "Event full. Monitor waitlist registrations." : "Turnout steady. Monitor registrations.",
        actionLabel: "Monitor",
        actionType: "MONITOR"
    })));
});

app.get('/api/admin/events/forecast', (req, res) => {
    res.json(events.map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        date: e.date,
        venue: e.location,
        price: e.price,
        registrations: e.registrations,
        capacity: e.capacity,
        fillRate: Math.floor((e.registrations / e.capacity) * 100),
        daysLeft: 10,
        successRate: 72,
        tier: e.registrations >= e.capacity ? '🔥 Sold Out' : '📈 Growing',
        tierColor: e.registrations >= e.capacity ? '#ef4444' : '#f59e0b',
        interestedUsers: 4,
        pageViews: 8,
        bookingVelocity: 0.9,
        strategies: [{ icon: '📢', title: 'Boost Social Visibility', desc: 'Feature this event on the home hero banner.' }]
    })));
});

app.get('/api/admin/events/insights', (req, res) => {
    res.json(events.map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        views: 12,
        clicks: 8,
        bookings: e.registrations,
        totalInteractions: 20 + e.registrations,
        conversionRate: Math.round((e.registrations / 20) * 100),
        sentiment: "Favorable",
        sentimentScore: 78,
        interestedUsers: 3,
        aiSummary: `Event '${e.title}' is showing steady traction. Student engagement is favorable with positive interest in the ${e.category} department.`
    })));
});

// --- REFUND ---
app.post('/api/bookings/:id/refund', (req, res) => {
    const idx = bookings.findIndex(b => String(b.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Booking not found' });
    bookings[idx].status = 'Refunded';
    res.json({ success: true, message: 'Refund processed successfully' });
});

// --- HEALTH & CONFIG ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', environment: 'Vercel Serverless' }));

module.exports = app;
