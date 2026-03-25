from database import db
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email
        }

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    max_absences = db.Column(db.Integer, default=0)
    target_grade = db.Column(db.Float, default=6.0)
    color = db.Column(db.String(20), default="#ffffff")
    notes = db.Column(db.Text, nullable=True)

    activities = db.relationship('Activity', backref='subject', lazy=True, cascade="all, delete-orphan")
    schedules = db.relationship('Schedule', backref='subject', lazy=True, cascade="all, delete-orphan")
    absences = db.relationship('Absence', backref='subject', lazy=True, cascade="all, delete-orphan")
    grades = db.relationship('Grade', backref='subject', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "max_absences": self.max_absences,
            "target_grade": self.target_grade,
            "color": self.color,
            "notes": self.notes or ""
        }

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.String(10), nullable=True) # YYYY-MM-DD
    status = db.Column(db.String(20), default="pending") # pending, completed
    activity_type = db.Column(db.String(50), default="general") # exam, assignment, general

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "subject_id": self.subject_id,
            "title": self.title,
            "description": self.description,
            "notes": self.notes or "",
            "due_date": self.due_date,
            "status": self.status,
            "activity_type": self.activity_type
        }

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False) # 0=Monday, 6=Sunday
    start_time = db.Column(db.String(5), nullable=False) # HH:MM
    end_time = db.Column(db.String(5), nullable=False) # HH:MM
    location = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "subject_id": self.subject_id,
            "title": self.title,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "location": self.location
        }

class Absence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    date = db.Column(db.String(10), nullable=False) # YYYY-MM-DD
    reason = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "subject_id": self.subject_id,
            "date": self.date,
            "reason": self.reason
        }

class Grade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    value = db.Column(db.Float, nullable=False)       # nota obtida
    max_value = db.Column(db.Float, default=10.0)     # valor total da prova
    weight = db.Column(db.Float, default=1.0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "subject_id": self.subject_id,
            "description": self.description,
            "value": self.value,
            "max_value": self.max_value,
            "weight": self.weight
        }

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False, default="Sem título")
    content = db.Column(db.Text, nullable=True)
    parent_type = db.Column(db.String(20), nullable=False)  # 'subject' or 'activity'
    parent_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.String(19), nullable=True)  # ISO datetime string

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "content": self.content or "",
            "parent_type": self.parent_type,
            "parent_id": self.parent_id,
            "created_at": self.created_at
        }
