import os
import time
import json
import secrets
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from jose import JWTError, jwt
import bcrypt

# --- CONFIGURATION ---
SECRET_KEY = secrets.token_hex(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

DATABASE_URL = "sqlite:///./events.db"

# --- DATABASE SETUP ---
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELS ---
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    provider = Column(String, default="LOCAL")
    google_id = Column(String, nullable=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    badges_json = Column(String, default="[]") # Store badges as JSON string
    interests_json = Column(String, default="[]")
    
    # Relationship for Bookings
    bookings = relationship("BookingModel", back_populates="user")

class EventModel(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String)
    description = Column(String)
    event_date = Column(DateTime)
    venue = Column(String)
    category = Column(String)
    price_general = Column(Float)
    price_vip = Column(Float)
    total_tickets = Column(Integer)
    available_tickets_general = Column(Integer)
    available_tickets_vip = Column(Integer)
    image_url = Column(String, nullable=True)

class BookingModel(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    attendee_name = Column(String)
    attendee_email = Column(String)
    ticket_type = Column(String)
    number_of_tickets = Column(Integer)
    total_amount = Column(Float)
    booking_date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    
    event = relationship("EventModel")
    user = relationship("UserModel", back_populates="bookings")

class UserInteractionModel(Base):
    __tablename__ = "user_interactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    interaction_type = Column(String)  # 'view', 'click', 'book'
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# --- UTILS ---
def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- SCHEMAS ---
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    googleId: str
    email: str
    name: Optional[str] = None

class EventBase(BaseModel):
    eventName: str
    description: str
    eventDate: datetime
    venue: str
    category: str
    priceGeneral: float
    priceVIP: float
    totalTickets: int
    availableTicketsGeneral: int
    availableTicketsVIP: int
    imageUrl: Optional[str] = None

class BookingCreate(BaseModel):
    eventId: int
    userId: int
    userName: str
    userEmail: str
    tickets: int
    paidAmount: float
    promoUsed: Optional[str] = ""

# --- WEBSOCKET MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# --- FASTAPI APP ---
app = FastAPI(title="Ticket Booking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES ---

@app.post("/api/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(UserModel).filter(UserModel.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    is_admin = user.email.endswith("@nexus.edu")
    db_user = UserModel(name=user.name, email=user.email, password=hash_password(user.password), is_admin=is_admin, provider="LOCAL")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_access_token({"sub": db_user.email, "isAdmin": db_user.is_admin})
    return {"token": token, "user": {
        "id": db_user.id, 
        "name": db_user.name, 
        "email": db_user.email, 
        "role": "admin" if db_user.is_admin else "student",
        "provider": db_user.provider,
        "xp": db_user.xp or 0,
        "level": db_user.level or 1,
        "badges": json.loads(db_user.badges_json or "[]")
    }}

@app.post("/api/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": db_user.email, "isAdmin": db_user.is_admin})
    return {"token": token, "user": {
        "id": db_user.id, 
        "name": db_user.name, 
        "email": db_user.email, 
        "role": "admin" if db_user.is_admin else "student",
        "provider": db_user.provider,
        "xp": db_user.xp or 0,
        "level": db_user.level or 1,
        "badges": json.loads(db_user.badges_json or "[]")
    }}

@app.post("/api/auth/google")
def google_auth(data: GoogleLogin, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.google_id == data.googleId).first()
    if not db_user:
        db_user = db.query(UserModel).filter(UserModel.email == data.email).first()
        if db_user:
            db_user.google_id = data.googleId
            db_user.provider = "GOOGLE"
        else:
            is_admin = data.email.endswith("@nexus.edu")
            db_user = UserModel(name=data.name or data.email.split("@")[0], email=data.email, google_id=data.googleId, is_admin=is_admin, provider="GOOGLE")
            db.add(db_user)
        db.commit()
        db.refresh(db_user)
    token = create_access_token({"sub": db_user.email, "isAdmin": db_user.is_admin})
    return {"token": token, "user": {"id": db_user.id, "name": db_user.name, "email": db_user.email, "isAdmin": db_user.is_admin, "provider": db_user.provider}}

@app.get("/api/events")
def get_events(db: Session = Depends(get_db)):
    events = db.query(EventModel).all()
    return [{
        "id": e.id,
        "title": e.event_name, # Frontend expects 'title'
        "eventName": e.event_name,
        "description": e.description,
        "date": e.event_date.isoformat(), # Frontend expects 'date'
        "eventDate": e.event_date.isoformat(),
        "venue": e.venue,
        "location": e.venue, # Frontend map expects 'location'
        "category": e.category,
        "price": e.price_general, # Frontend expects 'price'
        "priceGeneral": e.price_general,
        "priceVIP": e.price_vip,
        "capacity": e.total_tickets, # Frontend expects 'capacity'
        "totalTickets": e.total_tickets,
        "registrations": e.total_tickets - (e.available_tickets_general + e.available_tickets_vip), # Frontend expects 'registrations'
        "availableTicketsGeneral": e.available_tickets_general,
        "availableTicketsVIP": e.available_tickets_vip,
        "imageUrl": e.image_url
    } for e in events]

@app.get("/api/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    e = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not e: raise HTTPException(status_code=404, detail="Event not found")
    return {
        "id": e.id,
        "title": e.event_name,
        "eventName": e.event_name,
        "description": e.description,
        "date": e.event_date.isoformat(),
        "eventDate": e.event_date.isoformat(),
        "venue": e.venue,
        "location": e.venue, # Frontend map expects 'location'
        "category": e.category,
        "price": e.price_general,
        "priceGeneral": e.price_general,
        "priceVIP": e.price_vip,
        "capacity": e.total_tickets,
        "totalTickets": e.total_tickets,
        "registrations": e.total_tickets - (e.available_tickets_general + e.available_tickets_vip),
        "availableTicketsGeneral": e.available_tickets_general,
        "availableTicketsVIP": e.available_tickets_vip,
        "imageUrl": e.image_url
    }

@app.post("/api/bookings")
async def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    db_event = db.query(EventModel).filter(EventModel.id == booking.eventId).first()
    if not db_event: raise HTTPException(status_code=404, detail="Event not found")
    
    # Check ticket availability (Assuming general for simplicity since frontend doesn't send type)
    if db_event.available_tickets_general < booking.tickets:
        raise HTTPException(status_code=400, detail="Not enough tickets available")
    
    db_event.available_tickets_general -= booking.tickets
    
    db_booking = BookingModel(
        attendee_name=booking.userName,
        attendee_email=booking.userEmail,
        ticket_type="General",
        number_of_tickets=booking.tickets,
        total_amount=booking.paidAmount,
        user_id=booking.userId, # Save the userId
        event_id=booking.eventId
    )
    
    db.add(db_booking)
    
    # Achievement Engine
    db_user = db.query(UserModel).filter(UserModel.id == booking.userId).first()
    if db_user:
        db_user.xp = (db_user.xp or 0) + 100
        db_user.level = (db_user.xp // 500) + 1
        
        # Award Badges
        current_badges = json.loads(db_user.badges_json or "[]")
        badge_names = [b['name'] for b in current_badges]
        
        # 1. First Timer Badge
        if "First Timer" not in badge_names:
            current_badges.append({"id": "first", "name": "First Timer", "icon": "🎖️", "date": datetime.now().strftime("%Y-%m-%d")})
            
        # 2. Tech Enthusiast
        if db_event.category == "Technology" and "Tech Enthusiast" not in badge_names:
            current_badges.append({"id": "tech", "name": "Tech Enthusiast", "icon": "💻", "date": datetime.now().strftime("%Y-%m-%d")})
            
        # 3. Serial Attender
        total_bookings = db.query(BookingModel).filter(BookingModel.user_id == db_user.id).count()
        if total_bookings >= 3 and "Serial Attender" not in badge_names:
            current_badges.append({"id": "serial", "name": "Serial Attender", "icon": "🔥", "date": datetime.now().strftime("%Y-%m-%d")})
            
        db_user.badges_json = json.dumps(current_badges)

    db.commit()
    db.refresh(db_booking)
    
    await manager.broadcast({
        "type": "EVENT_UPDATE", 
        "event": {
            "id": db_event.id, 
            "availableTicketsGeneral": db_event.available_tickets_general, 
            "availableTicketsVIP": db_event.available_tickets_vip
        }
    })
    await manager.broadcast({
        "type": "NOTIFICATION", 
        "message": f"{booking.userName} just booked {booking.tickets} ticket(s) for {db_event.event_name}!"
    })
    return {
        "id": db_booking.id, 
        "attendeeName": db_booking.attendee_name, 
        "totalAmount": db_booking.total_amount, 
        "event": {"id": db_event.id, "eventName": db_event.event_name},
        "newXP": db_user.xp if db_user else 0,
        "newLevel": db_user.level if db_user else 1,
        "newBadges": json.loads(db_user.badges_json or "[]") if db_user else []
    }

@app.get("/api/bookings/user/{user_id}")
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(BookingModel).filter(BookingModel.user_id == user_id).all()
    return [{
        "id": b.id,
        "attendeeName": b.attendee_name,
        "attendeeEmail": b.attendee_email,
        "ticketType": b.ticket_type,
        "numberOfTickets": b.number_of_tickets,
        "totalAmount": b.total_amount,
        "timestamp": b.booking_date.isoformat(),
        "status": "Confirmed",
        "event": {
            "id": b.event.id,
            "title": b.event.event_name,
            "price": b.event.price_general,
            "category": b.event.category,
            "location": b.event.venue,
            "date": b.event.event_date.isoformat()
        }
    } for b in bookings]

@app.post("/api/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Restore capacity to the event
    event = db.query(EventModel).filter(EventModel.id == booking.event_id).first()
    if event:
        event.available_tickets_general += booking.number_of_tickets
    
    # Delete the booking
    db.delete(booking)
    db.commit()
    
    return {"message": "Booking cancelled and capacity restored successfully"}

@app.patch("/api/events/{event_id}/capacity")
def update_event_capacity(event_id: int, data: dict, db: Session = Depends(get_db)):
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event: raise HTTPException(status_code=404, detail="Event not found")
    
    new_capacity = data.get("capacity")
    if new_capacity is not None:
        # Update total tickets
        event.total_tickets = new_capacity
        # Adjust available tickets based on current registrations
        registrations = event.total_tickets - (event.available_tickets_general + event.available_tickets_vip)
        # For simplicity, we just adjust general tickets
        event.available_tickets_general = new_capacity - registrations - event.available_tickets_vip
        
    db.commit()
    return {"message": "Capacity updated successfully", "newCapacity": event.total_tickets}

@app.get("/api/admin/users")
def get_admin_users(db: Session = Depends(get_db)):
    try:
        print("📡 [Admin] Fetching user list...")
        users = db.query(UserModel).all()
        return [{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "department": "Engineering" if "@nexus.edu" in u.email else "Arts",
            "role": "admin" if u.is_admin else "student"
        } for u in users]
    except Exception as e:
        print(f"❌ Error in get_admin_users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/report")
def get_admin_report(db: Session = Depends(get_db)):
    try:
        print("📊 [Admin] Generating platform report...")
        total_users = db.query(UserModel).count()
        total_bookings = db.query(BookingModel).count()
        
        # More robust revenue calculation
        all_bookings = db.query(BookingModel).all()
        total_revenue = sum([b.total_amount for b in all_bookings if b.total_amount])
        
        booking_list = [{
            "id": b.id,
            "userId": b.user_id,
            "attendeeName": b.attendee_name,
            "status": "Confirmed",
            "event": {
                "title": b.event.event_name if b.event else "Deleted Event",
                "price": b.total_amount
            }
        } for b in all_bookings]

        return {
            "generatedAt": datetime.now().strftime("%Y-%m-%d, %H:%M:%S"),
            "stats": {
                "totalUsers": total_users,
                "totalBookings": total_bookings,
                "revenue": round(total_revenue, 2)
            },
            "allBookings": booking_list,
            "departmentStats": [
                { "label": "CS", "value": 120, "color": "#6e8efb" },
                { "label": "Engineering", "value": 85, "color": "#a777e3" },
                { "label": "Arts", "value": 45, "color": "#ff6b6b" },
                { "label": "Medical", "value": 30, "color": "#2ecc71" }
            ]
        }
    except Exception as e:
        print(f"❌ Error in get_admin_report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/verify/{booking_id}")
def verify_ticket(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Invalid Ticket ID")
    return {
        "id": booking.id,
        "userName": booking.attendee_name,
        "userEmail": booking.attendee_email,
        "status": "Verified ✅",
        "event": {
            "title": booking.event.event_name,
            "location": booking.event.venue,
            "date": booking.event.event_date.strftime("%b %d, %H:%M")
        }
    }

@app.post("/api/admin/checkin/{booking_id}")
def checkin_ticket(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # In a real app, we would add a 'checked_in' column to BookingModel
    # For now, we'll return a success status to satisfy the frontend
    return {
        "id": booking.id,
        "userName": booking.attendee_name,
        "userEmail": booking.attendee_email,
        "status": "Checked In", # Change status to 'Checked In'
        "event": {
            "title": booking.event.event_name,
            "location": booking.event.venue,
            "date": booking.event.event_date.strftime("%b %d, %H:%M")
        }
    }

# --- INTERESTS ---
@app.get("/api/users/{user_id}/interests")
def get_user_interests(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        return json.loads(user.interests_json) if user.interests_json else []
    except Exception:
        return []

class InterestsUpdate(BaseModel):
    interests: List[str]

@app.post("/api/users/{user_id}/interests")
def update_user_interests(user_id: int, data: InterestsUpdate, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.interests_json = json.dumps(data.interests)
    db.commit()
    return {"success": True, "interests": data.interests}

# --- USER INTERACTIONS TRACKING ---
class InteractionCreate(BaseModel):
    eventId: int
    type: str # 'view', 'click', 'book'

@app.post("/api/users/{user_id}/interactions")
def create_interaction(user_id: int, data: InteractionCreate, db: Session = Depends(get_db)):
    event = db.query(EventModel).filter(EventModel.id == data.eventId).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    interaction = UserInteractionModel(
        user_id=user_id,
        event_id=data.eventId,
        interaction_type=data.type,
        timestamp=datetime.utcnow()
    )
    db.add(interaction)
    db.commit()
    return {"success": True}

# --- AI RECOMMENDATIONS ---
@app.get("/api/users/{user_id}/recommendations")
def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        interests = json.loads(user.interests_json) if user.interests_json else []
    except Exception:
        interests = []
        
    user_dept = "CS" if "student" in user.email or "rahul" in user.email else ("IT" if "saranya" in user.email else "")
    
    bookings = db.query(BookingModel).filter(BookingModel.user_id == user_id).all()
    booked_categories = [b.event.category for b in bookings if b.event]
    
    interactions = db.query(UserInteractionModel).filter(UserInteractionModel.user_id == user_id).all()
    viewed_event_ids = [i.event_id for i in interactions if i.interaction_type in ["view", "click"]]
    viewed_events = db.query(EventModel).filter(EventModel.id.in_(viewed_event_ids)).all() if viewed_event_ids else []
    viewed_categories = [e.category for e in viewed_events]
    
    upcoming_events = db.query(EventModel).all()
    
    recommendations = []
    for event in upcoming_events:
        if any(b.event_id == event.id for b in bookings):
            continue
            
        score = 0
        reasons = []
        
        if user_dept:
            if (user_dept == "CS" or user_dept == "IT") and event.category in ["Technology", "Computer Science", "Gaming"]:
                score += 12
                reasons.append(f"Matches your {user_dept} Department curriculum")
                
        if event.category in interests:
            score += 10
            reasons.append(f"Matches your interest in {event.category}")
            
        bookings_count = booked_categories.count(event.category)
        if bookings_count > 0:
            score += min(bookings_count * 6, 18)
            reasons.append(f"You booked {bookings_count} event(s) in {event.category} before")
            
        views_count = viewed_categories.count(event.category)
        if views_count > 0:
            score += min(views_count * 2, 8)
            reasons.append(f"You recently viewed {event.category} events")
            
        if score > 0:
            match_percentage = min(60 + (score * 2), 99)
            primary_reason = reasons[0] if reasons else f"Popular in {event.category}"
            
            regs = event.total_tickets - event.available_tickets_general
            
            recommendations.append({
                "id": event.id,
                "title": event.event_name,
                "category": event.category,
                "description": event.description,
                "price": event.price_general,
                "date": event.event_date.strftime("%Y-%m-%d"),
                "location": event.venue,
                "imageUrl": event.image_url,
                "capacity": event.total_tickets,
                "registrations": regs,
                "matchPercentage": int(match_percentage),
                "matchReason": primary_reason
            })
            
    recommendations.sort(key=lambda x: x["matchPercentage"], reverse=True)
    return recommendations[:6]

# --- AI CHATBOT ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    userId: Optional[int] = None

@app.post("/api/chat")
def chatbot_chat(req: ChatRequest, db: Session = Depends(get_db)):
    events = db.query(EventModel).all()
    events_str = ""
    for e in events[:10]:
        regs = e.total_tickets - e.available_tickets_general
        status = "Sold Out" if e.available_tickets_general <= 0 else f"{e.available_tickets_general} seats available"
        events_str += f"- {e.event_name} ({e.category}) on {e.event_date.strftime('%b %d')}, Venue: {e.venue}, Price: ₹{e.price_general}, Status: {status}\n"
        
    system_instruction = (
        "You are Nexus AI, the official Student Event Assistant for EventNexus.\n"
        "Here are the active campus events:\n"
        f"{events_str}\n"
        "Policies & FAQs:\n"
        "- Cancellation: Tickets can be cancelled anytime. Refunds are initiated instantly but processed by administrators.\n"
        "- Waitlist Claim Window: If promoted from waitlist, you have EXACTLY 10 minutes to claim before the ticket expires.\n"
        "- Gamification: Booking events awards XP and levels. Attending 3+ events unlocks special badges like 'Nexus Pioneer' or 'Early Bird'.\n"
        "- Booking guide: Navigate to the Home page, click on any event, and click 'Book Now'.\n\n"
        "Instructions:\n"
        "Answer the user's questions politely. If they ask for event recommendations, suggest 1 or 2 matching events from the list above. Keep responses concise and use formatting/emojis."
    )
    
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
            
            contents = []
            for h in req.history:
                role = "user" if h.role == "user" else "model"
                contents.append({"role": role, "parts": [h.content]})
            
            contents.append({"role": "user", "parts": [req.message]})
            
            response = model.generate_content(contents)
            return {"response": response.text}
        except Exception as e:
            print(f"⚠️ Gemini API failed: {str(e)}. Falling back to local heuristics.")
            
    msg = req.message.lower()
    resp = ""
    
    if "event" in msg or "show" in msg or "recommend" in msg:
        tech_events = [e.event_name for e in events if e.category in ["Technology", "Gaming", "Education"]]
        music_events = [e.event_name for e in events if e.category in ["Music", "Entertainment", "Art"]]
        
        if "tech" in msg or "cs" in msg or "code" in msg:
            resp = f"🤖 I highly recommend checking out our tech events: **{', '.join(tech_events[:2])}**! You can book them directly from the home feed."
        elif "music" in msg or "art" in msg or "fun" in msg:
            resp = f"🤖 You might enjoy **{', '.join(music_events[:2])}**! They have great reviews and tickets are booking fast."
        else:
            featured = [e.event_name for e in events[:3]]
            resp = f"🤖 Here are some featured events on campus:\n" + "\n".join([f"- **{f}**" for f in featured]) + "\n\nLet me know if you'd like details on any of these!"
            
    elif "cancel" in msg or "refund" in msg:
        resp = "🤖 **Ticket Cancellation Policy:**\nYou can cancel your booking from your Student Dashboard. Once cancelled, slot recovery will automatically promote the next student in the waitlist. Refunds are initiated instantly but require admin approval."
        
    elif "waitlist" in msg or "claim" in msg:
        resp = "🤖 **Waitlist Policy:**\nWhen a seat becomes available, the first waitlisted student is promoted. You will have a **10-minute window** to claim your ticket before the slot is passed to the next student."
        
    elif "badge" in msg or "xp" in msg or "level" in msg or "gam" in msg:
        resp = "🤖 **Gamification System:**\nEarn XP for every event booked! Accumulate XP to level up. You can view your current level and unlockable badges (like *Nexus Pioneer*) on your **Profile Page**."
        
    elif "hi" in msg or "hello" in msg or "hey" in msg:
        resp = "🤖 Hello! I am Nexus AI. I can help you search for campus events, understand ticket/waitlist policies, or explain how to earn badges. What's on your mind today?"
        
    else:
        resp = "🤖 I'm here to help with campus events! For booking, go to the Home screen and select an event. For waitlist questions, remember you have a 10-minute claim window. What else can I help you find?"
        
    return {"response": resp}

# --- AI ATTENDANCE PREDICTION ---
@app.get("/api/admin/events/predictions")
def get_predictions(db: Session = Depends(get_db)):
    events = db.query(EventModel).all()
    predictions = []
    
    total_users = db.query(UserModel).count() or 1
    
    for event in events:
        days_left = (event.event_date - datetime.now()).days
        
        regs = event.total_tickets - event.available_tickets_general
        cap = event.total_tickets
        reg_ratio = regs / cap if cap > 0 else 0
        
        interested_users = 0
        users = db.query(UserModel).all()
        for u in users:
            try:
                ints = json.loads(u.interests_json) if u.interests_json else []
                if event.category in ints:
                    interested_users += 1
            except Exception:
                pass
        
        interest_ratio = interested_users / total_users
        
        predicted_turnout = reg_ratio * 100
        
        if days_left > 0:
            speed_factor = (reg_ratio / max(days_left, 1)) * 5
            predicted_turnout += speed_factor * 10
        else:
            predicted_turnout = reg_ratio * 100
            
        predicted_turnout += interest_ratio * 25
        predicted_turnout = max(15, min(100, predicted_turnout))
        
        if predicted_turnout >= 90 and reg_ratio > 0.70:
            advice = f"High Demand! Suggest increasing capacity by +20% (+{int(cap * 0.2)} seats) to accommodate waitlisted students."
            action_label = "Optimize Capacity (+20%)"
            action_type = "OPTIMIZE"
        elif days_left < 10 and predicted_turnout < 40:
            advice = "Low Turnout predicted. Recommend distributing a 15% promo code or cross-promoting to target departments."
            action_label = "Distribute Promo Code"
            action_type = "PROMOTE"
        else:
            advice = "Turnout steady. Monitor waitlist registrations."
            action_label = "Monitor"
            action_type = "MONITOR"
            
        if days_left < 3:
            confidence = "High (92%)"
        elif days_left < 10:
            confidence = "Medium (78%)"
        else:
            confidence = "Low (61%)"
            
        predictions.append({
            "id": event.id,
            "title": event.event_name,
            "category": event.category,
            "date": event.event_date.strftime("%Y-%m-%d"),
            "registrations": regs,
            "capacity": cap,
            "predictedTurnout": int(predicted_turnout),
            "confidence": confidence,
            "suggestion": advice,
            "actionLabel": action_label,
            "actionType": action_type
        })
        
    return predictions

# --- AI POPULARITY FORECAST ---
@app.get("/api/admin/events/forecast")
def get_popularity_forecast(db: Session = Depends(get_db)):
    events = db.query(EventModel).all()
    total_users = db.query(UserModel).count() or 1
    all_users = db.query(UserModel).all()
    all_bookings = db.query(BookingModel).all()
    all_interactions = db.query(UserInteractionModel).all()
    forecasts = []

    for event in events:
        regs = event.total_tickets - event.available_tickets_general
        cap = event.total_tickets
        reg_ratio = regs / cap if cap > 0 else 0
        days_left = (event.event_date - datetime.now()).days

        # --- Interest Signal ---
        interested_count = sum(
            1 for u in all_users
            if event.category in (json.loads(u.interests_json) if u.interests_json else [])
        )
        interest_score = (interested_count / total_users) * 30

        # --- Booking Velocity (registrations per day since event was created) ---
        # Approximate: assume event was "created" 60 days before its date
        days_active = max(1, 60 - days_left)
        booking_velocity = regs / days_active
        velocity_score = min(booking_velocity * 5, 25)

        # --- Social/Interaction Signal ---
        event_interactions = [i for i in all_interactions if i.event_id == event.id]
        interaction_score = min(len(event_interactions) * 2, 20)

        # --- Recency Urgency Boost ---
        urgency_score = 0
        if 0 < days_left <= 7:
            urgency_score = 15
        elif 0 < days_left <= 14:
            urgency_score = 8

        # --- Price Accessibility Score ---
        price_score = 10 if event.price_general <= 200 else (7 if event.price_general <= 500 else 4)

        total_score = interest_score + velocity_score + interaction_score + urgency_score + price_score
        success_rate = max(10, min(98, total_score))

        # --- Success Tier ---
        if success_rate >= 80:
            tier = "🔥 High Demand"
            tier_color = "#22c55e"
        elif success_rate >= 55:
            tier = "📈 Growing"
            tier_color = "#f59e0b"
        elif success_rate >= 35:
            tier = "🔔 Moderate"
            tier_color = "#6366f1"
        else:
            tier = "❄️ Low Traction"
            tier_color = "#ef4444"

        # --- Marketing Strategy Recommendations ---
        strategies = []
        if interest_score < 10:
            strategies.append({
                "icon": "🎯",
                "title": "Target Interest Groups",
                "desc": f"Only {interested_count} users have listed {event.category} as an interest. Push notifications to relevant department students."
            })
        if booking_velocity < 1:
            strategies.append({
                "icon": "⚡",
                "title": "Flash Sale Promo",
                "desc": "Booking velocity is low. Launch a 24-hour flash sale with a 15% discount code to spike registrations."
            })
        if len(event_interactions) < 5:
            strategies.append({
                "icon": "📢",
                "title": "Boost Social Visibility",
                "desc": "This event has low page views. Feature it on the home screen hero banner and push a campus-wide announcement."
            })
        if days_left <= 7 and reg_ratio < 0.6:
            strategies.append({
                "icon": "🔔",
                "title": "Last-Week Urgency Push",
                "desc": "Send 'Seats Filling Up!' reminders to users who viewed this event but did not book."
            })
        if event.price_general > 600:
            strategies.append({
                "icon": "💳",
                "title": "Introduce Group Discount",
                "desc": "High ticket price may deter students. Offer a 20% group discount for 3+ bookings."
            })
        if reg_ratio >= 0.85:
            strategies.append({
                "icon": "🚀",
                "title": "Expand Capacity",
                "desc": f"Near sold out! Increase capacity to capture waitlist demand. Current fill rate: {int(reg_ratio*100)}%."
            })
        if not strategies:
            strategies.append({
                "icon": "✅",
                "title": "On Track",
                "desc": "This event is performing well. Maintain current promotion cadence and monitor waitlist growth."
            })

        forecasts.append({
            "id": event.id,
            "title": event.event_name,
            "category": event.category,
            "date": event.event_date.strftime("%Y-%m-%d"),
            "venue": event.venue,
            "price": event.price_general,
            "registrations": regs,
            "capacity": cap,
            "fillRate": int(reg_ratio * 100),
            "daysLeft": days_left,
            "successRate": int(success_rate),
            "tier": tier,
            "tierColor": tier_color,
            "interestedUsers": interested_count,
            "pageViews": len(event_interactions),
            "bookingVelocity": round(booking_velocity, 2),
            "strategies": strategies
        })

    forecasts.sort(key=lambda x: x["successRate"], reverse=True)
    return forecasts

# --- AI SMART EVENT INSIGHTS ---
@app.get("/api/admin/events/insights")
def get_event_insights(db: Session = Depends(get_db)):
    events = db.query(EventModel).all()
    all_users = db.query(UserModel).all()
    all_interactions = db.query(UserInteractionModel).all()
    all_bookings = db.query(BookingModel).all()
    
    insights = []
    
    for event in events:
        views = sum(1 for i in all_interactions if i.event_id == event.id and i.interaction_type == 'view')
        clicks = sum(1 for i in all_interactions if i.event_id == event.id and i.interaction_type == 'click')
        bookings = sum(1 for b in all_bookings if b.event_id == event.id)
        
        total_interactions = views + clicks + bookings
        total_views = views + clicks
        conversion_rate = round((bookings / total_views * 100), 1) if total_views > 0 else 0.0
        if bookings > 0 and total_views == 0:
            conversion_rate = 100.0
            
        interested_users = sum(
            1 for u in all_users
            if event.category in (json.loads(u.interests_json) if u.interests_json else [])
        )
        
        if conversion_rate >= 40:
            engagement_sentiment = "Highly Positive"
            sentiment_score = 92
        elif conversion_rate >= 20:
            engagement_sentiment = "Favorable"
            sentiment_score = 75
        elif interested_users > 2:
            engagement_sentiment = "Curious but hesitant"
            sentiment_score = 55
        else:
            engagement_sentiment = "Cold Interest"
            sentiment_score = 30
            
        ai_summary = ""
        gemini_key = os.environ.get("GEMINI_API_KEY")
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = (
                    f"Write a short, engaging 2-sentence executive summary analysis for a campus event planner.\n"
                    f"Event Title: {event.event_name}\n"
                    f"Category: {event.category}\n"
                    f"Description: {event.description}\n"
                    f"Stats: {views} views, {bookings} bookings out of {event.total_tickets} capacity, conversion rate {conversion_rate}%.\n"
                    f"Sentiment: {engagement_sentiment}.\n"
                    "Focus on highlighting student engagement trends and actionable next steps."
                )
                response = model.generate_content(prompt)
                ai_summary = response.text.strip()
            except Exception as e:
                print(f"⚠️ Gemini AI summary generation failed: {str(e)}")
                
        if not ai_summary:
            if conversion_rate >= 40:
                ai_summary = f"Event '{event.event_name}' is a major highlight on campus with an exceptional {conversion_rate}% conversion rate. Students show high intent, especially in the '{event.category}' space. Recommend opening a waitlist or expanding seats to sustain momentum."
            elif conversion_rate >= 15:
                ai_summary = f"'{event.event_name}' is displaying stable traction with steady booking rates. User interest in '{event.category}' remains moderate. Consider targeted departmental notifications to convert remaining page-viewers."
            else:
                ai_summary = f"'{event.event_name}' has captured lower booking conversion despite some page views. The topic might require additional marketing outreach or a pricing review (current price: ₹{event.price_general}) to improve student turnout."
                
        insights.append({
            "id": event.id,
            "title": event.event_name,
            "category": event.category,
            "views": views,
            "clicks": clicks,
            "bookings": bookings,
            "totalInteractions": total_interactions,
            "conversionRate": conversion_rate,
            "sentiment": engagement_sentiment,
            "sentimentScore": sentiment_score,
            "interestedUsers": interested_users,
            "aiSummary": ai_summary
        })
        
    return insights

@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    print("\n" + "="*50)
    print("🚀 NEXUS BACKEND STARTING: PERSISTENCE MODE ONLINE")
    print("="*50)
    
    # Auto-Migration Check
    try:
        # Check if the new badges column exists by running a dummy query
        db.query(UserModel).filter(UserModel.badges_json == "[]").first()
        print("✅ Database Schema is Up-to-Date")
    except Exception as e:
        print("⚠️ Schema Mismatch (Missing Badges Column). Resetting Database...")
        db.close()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()

    # Ensure Admin exists
    admin = db.query(UserModel).filter(UserModel.email == "saranya@nexus.edu").first()
    if not admin:
        admin = UserModel(name="Saranya Chowdary", email="saranya@nexus.edu", password=hash_password("admin123"), is_admin=True, provider="LOCAL")
        db.add(admin)
    
    # Ensure Student exists & has initial badges
    student = db.query(UserModel).filter(UserModel.email == "student@nexus.edu").first()
    if not student:
        initial_badges = [
            {"id": "welcome", "name": "Nexus Pioneer", "icon": "🚀", "date": datetime.now().strftime("%Y-%m-%d")},
            {"id": "profile", "name": "Early Bird", "icon": "🌅", "date": datetime.now().strftime("%Y-%m-%d")}
        ]
        student = UserModel(
            name="Nexus Student", 
            email="student@nexus.edu", 
            password=hash_password("student123"), 
            is_admin=False, 
            provider="LOCAL", 
            xp=450, 
            level=1,
            badges_json=json.dumps(initial_badges)
        )
        db.add(student)
    else:
        # If student exists but has no badges, grant them
        if not student.badges_json or student.badges_json == "[]":
            initial_badges = [
                {"id": "welcome", "name": "Nexus Pioneer", "icon": "🚀", "date": datetime.now().strftime("%Y-%m-%d")},
                {"id": "profile", "name": "Early Bird", "icon": "🌅", "date": datetime.now().strftime("%Y-%m-%d")}
            ]
            student.badges_json = json.dumps(initial_badges)

    # Seed events only if empty
    if db.query(EventModel).count() == 0:
        print("📁 Initializing first-time seed data...")
        events = [
            EventModel(event_name="Nexus Tech Summit 2024", description="The ultimate gathering for tech enthusiasts and students.", event_date=datetime.now() + timedelta(days=30), venue="Main Auditorium", category="Technology", price_general=299.0, price_vip=499.0, total_tickets=500, available_tickets_general=150, available_tickets_vip=50, image_url="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Harmony Music Fest", description="A night of soulful music and live performances.", event_date=datetime.now() + timedelta(days=15), venue="University Stadium", category="Music", price_general=150.0, price_vip=350.0, total_tickets=1000, available_tickets_general=400, available_tickets_vip=100, image_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="AI Workshop: Beginner", description="Learn the basics of AI and Machine Learning.", event_date=datetime.now() + timedelta(days=5), venue="CS Lab 1", category="Education", price_general=99.0, price_vip=199.0, total_tickets=50, available_tickets_general=5, available_tickets_vip=2, image_url="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Startup Pitch Night", description="Watch young entrepreneurs pitch their big ideas.", event_date=datetime.now() + timedelta(days=10), venue="Main Auditorium", category="Business", price_general=50.0, price_vip=150.0, total_tickets=200, available_tickets_general=80, available_tickets_vip=20, image_url="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Code-A-Thon 24", description="A 24-hour coding competition with exciting prizes.", event_date=datetime.now() + timedelta(days=20), venue="CS Lab 4", category="Technology", price_general=199.0, price_vip=399.0, total_tickets=300, available_tickets_general=100, available_tickets_vip=10, image_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Art & Craft Expo", description="Explore beautiful handmade crafts and paintings.", event_date=datetime.now() - timedelta(days=2), venue="Arts Gallery", category="Art", price_general=40.0, price_vip=100.0, total_tickets=500, available_tickets_general=300, available_tickets_vip=20, image_url="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Cultural Dance Night", description="Traditional and modern dance performances by students.", event_date=datetime.now() + timedelta(days=18), venue="University Stadium", category="Culture", price_general=120.0, price_vip=250.0, total_tickets=800, available_tickets_general=700, available_tickets_vip=100, image_url="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Gaming Championship", description="E-sports tournament featuring Valorant and FIFA.", event_date=datetime.now() + timedelta(days=25), venue="CS Lab 1", category="Gaming", price_general=250.0, price_vip=450.0, total_tickets=100, available_tickets_general=80, available_tickets_vip=20, image_url="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Photography Workshop", description="Master the art of clicking professional photos.", event_date=datetime.now() + timedelta(days=7), venue="Arts Gallery", category="Art", price_general=80.0, price_vip=180.0, total_tickets=40, available_tickets_general=35, available_tickets_vip=5, image_url="https://images.unsplash.com/photo-1452784444945-3f422708fe5e?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Yoga & Wellness Day", description="A morning dedicated to mental and physical health.", event_date=datetime.now() - timedelta(days=1), venue="Green Park", category="Health", price_general=30.0, price_vip=80.0, total_tickets=200, available_tickets_general=180, available_tickets_vip=20, image_url="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Stand-up Comedy Show", description="Laugh out loud with the best student comedians.", event_date=datetime.now() + timedelta(days=9), venue="Main Auditorium", category="Entertainment", price_general=100.0, price_vip=200.0, total_tickets=150, available_tickets_general=130, available_tickets_vip=20, image_url="https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Debate Championship", description="A battle of words on global pressing issues.", event_date=datetime.now() + timedelta(days=14), venue="Main Auditorium", category="Education", price_general=20.0, price_vip=50.0, total_tickets=100, available_tickets_general=90, available_tickets_vip=10, image_url="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Movie Marathon", description="Watch back-to-back sci-fi classics on the big screen.", event_date=datetime.now() + timedelta(days=21), venue="Main Auditorium", category="Entertainment", price_general=60.0, price_vip=120.0, total_tickets=400, available_tickets_general=350, available_tickets_vip=50, image_url="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Robotics Exhibition", description="Innovative robots designed by engineering students.", event_date=datetime.now() + timedelta(days=28), venue="CS Lab 4", category="Technology", price_general=150.0, price_vip=300.0, total_tickets=300, available_tickets_general=250, available_tickets_vip=50, image_url="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80"),
            EventModel(event_name="Alumni Networking Night", description="A special evening for alumni to reconnect and network.", event_date=datetime.now() - timedelta(days=5), venue="Main Auditorium", category="Networking", price_general=0.0, price_vip=0.0, total_tickets=200, available_tickets_general=0, available_tickets_vip=0, image_url="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80")
        ]
        db.add_all(events)
        db.flush() 

        # Seed past bookings for the Student
        if student:
            past_events = [events[-1], events[5], events[9]] # Alumni, Art, Yoga
            for pe in past_events:
                db.add(BookingModel(attendee_name=student.name, attendee_email=student.email, ticket_type="General", number_of_tickets=1, total_amount=pe.price_general, user_id=student.id, event_id=pe.id, booking_date=datetime.now() - timedelta(days=10)))

    db.commit()
    print("✨ SUCCESS: Ticket Verification Engine Online!")
    print("="*50 + "\n")
    db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005)
