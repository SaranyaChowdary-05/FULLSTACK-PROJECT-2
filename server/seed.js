const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const events = [
    { id: 1, title: "AI & Machine Learning Workshop", category: "Computer Science", description: "Hands-on training on Neural Networks and Deep Learning architectures.", price: 250.00, date: new Date("2026-05-10"), location: "CS Lab 4", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800", capacity: 50, registrations: 0 },
    { id: 2, title: "Annual Robotics Challenge", category: "Engineering", description: "Competing autonomous bots face off in the ultimate arena challenge.", price: 180.00, date: new Date("2026-05-15"), location: "Main Auditorium", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 0 },
    { id: 3, title: "Creative Arts Exhibition", category: "Fine Arts", description: "Showcasing local talent in painting, sculpture, and digital media.", price: 150.00, date: new Date("2026-05-18"), location: "Arts Gallery", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800", capacity: 150, registrations: 0 },
    { id: 4, title: "Quantum Physics Symposium", category: "Physics", description: "Keynote speeches on Entanglement and Quantum Computing future.", price: 160.00, date: new Date("2026-05-22"), location: "Science Hall B", imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800", capacity: 80, registrations: 0 },
    { id: 5, title: "Global Business Strategy Meet", category: "Commerce", description: "Case studies on international market expansion and fiscal policy.", price: 200.00, date: new Date("2026-05-25"), location: "Business Center", imageUrl: "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=800", capacity: 50, registrations: 0 },
    { id: 6, title: "Bio-Tech Innovation Fair", category: "Biology", description: "Exhibiting the latest in CRISPR and sustainable bio-engineering.", price: 500.00, date: new Date("2026-05-28"), location: "Bio-Tech Wing", imageUrl: "https://images.unsplash.com/photo-1532187863486-abf91ad1b099?auto=format&fit=crop&q=80&w=800", capacity: 120, registrations: 0 },
    { id: 7, title: "Literature & Poetry Slam", category: "English", description: "A night of spoken word, classical readings, and modern prose.", price: 300.00, date: new Date("2026-06-02"), location: "Open Air Theatre", imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800", capacity: 300, registrations: 0 },
    { id: 8, title: "Cyber Security: CTF Challenge", category: "IT Dept", description: "Capture the Flag competition for ethical hacking enthusiasts.", price: 250.00, date: new Date("2026-06-05"), location: "Network Lab", imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800", capacity: 60, registrations: 0 },
    { id: 9, title: "Civil Bridge Design Contest", category: "Civil Dept", description: "Structural modeling and stress testing for upcoming engineers.", price: 180.00, date: new Date("2026-06-10"), location: "Design Studio", imageUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800", capacity: 40, registrations: 0 },
    { id: 10, title: "Psychology & Wellness Seminar", category: "Psychology", description: "Exploring mental health strategies in a high-stress environment.", price: 200.00, date: new Date("2026-06-15"), location: "Seminar Room 1", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 0 },
    { id: 11, title: "Inter-Dept Football Cup", category: "Sports", description: "The annual soccer showdown between departments.", price: 150.00, date: new Date("2026-06-20"), location: "University Stadium", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800", capacity: 1000, registrations: 0 },
    { id: 12, title: "First Aid Training", category: "Medical", description: "Certified workshop on CPR and emergency response techniques.", price: 175.00, date: new Date("2026-06-22"), location: "Medical Center", imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800", capacity: 30, registrations: 0 },
    { id: 13, title: "Sustainable City Design", category: "Architecture", description: "Exhibiting 3D models of eco-friendly urban landscapes.", price: 190.00, date: new Date("2026-06-25"), location: "Design Hall A", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 0 },
    { id: 14, title: "Molecular Gastronomy", category: "Chemistry", description: "The science of cooking: turning liquids into solid spheres.", price: 350.00, date: new Date("2026-06-28"), location: "Chemistry Lab 2", imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800", capacity: 25, registrations: 0 },
    { id: 15, title: "Jazz & Blues Night", category: "Music", description: "An evening of smooth rhythms and soul-stirring performances.", price: 220.00, date: new Date("2026-07-02"), location: "Music Hall", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800", capacity: 200, registrations: 0 },
    { id: 16, title: "Ancient Civilizations", category: "History", description: "Uncovering the secrets of Mayan and Mesopotamian cultures.", price: 160.00, date: new Date("2026-07-05"), location: "Room 302", imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 0 },
    { id: 17, title: "Calculus Competition", category: "Math", description: "High-stakes problem solving for the brightest math minds.", price: 150.00, date: new Date("2026-07-10"), location: "Main Hall", imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 0 },
    { id: 18, title: "Tree Plantation Drive", category: "Environment", description: "Join us in planting 1000 saplings across the campus.", price: 150.00, date: new Date("2026-07-12"), location: "North Campus", imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800", capacity: 1000, registrations: 0 },
    { id: 19, title: "Eco-Friendly Runway", category: "Fashion", description: "Clothing designs made entirely from recycled materials.", price: 450.00, date: new Date("2026-07-15"), location: "Grand Plaza", imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800", capacity: 500, registrations: 0 },
    { id: 20, title: "Comet Observation Night", category: "Astronomy", description: "Telescope viewing of the approaching Halley-type comet.", price: 180.00, date: new Date("2026-07-18"), location: "Observatory", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800", capacity: 200, registrations: 0 },
    { id: 21, title: "Urban Landscape Masterclass", category: "Photography", description: "Capturing the city's soul during the golden hour.", price: 275.00, date: new Date("2026-07-22"), location: "Meeting Point: Lobby", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800", capacity: 15, registrations: 0 },
    { id: 22, title: "Esports Championship", category: "Gaming", description: "Compete in Valorant and FIFA for the title of Campus Champ.", price: 300.00, date: new Date("2026-07-25"), location: "IT Lab 1", imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800", capacity: 64, registrations: 0 },
    { id: 23, title: "Fact-Checking Workshop", category: "Journalism", description: "Tools and techniques to spot misinformation online.", price: 150.00, date: new Date("2026-07-28"), location: "Media Room", imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800", capacity: 80, registrations: 0 },
    { id: 24, title: "Mock Trial: Ethics", category: "Law", description: "Students argue a high-profile case on corporate ethics.", price: 150.00, date: new Date("2026-08-02"), location: "Moot Court", imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 0 },
    { id: 25, title: "Philosophy: Existentialism", category: "Philosophy", description: "Debating the meaning of life in a modern world.", price: 150.00, date: new Date("2026-08-05"), location: "Library Annex", imageUrl: "https://images.unsplash.com/photo-1518060453314-ad9758133b17?auto=format&fit=crop&q=80&w=800", capacity: 100, registrations: 0 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Event.deleteMany({});
    await Event.insertMany(events);
    console.log('🌱 25 Premium Events Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();
