import os
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from database import db
from models import User, Subject, Activity, Schedule, Absence, Grade, Note, StudySession
from sqlalchemy import or_
from config import NeonConfig

app = Flask(__name__)

# Configuração exclusiva para Neon.tech (PostgreSQL)
app.config.from_object(NeonConfig)

print("🔧 Configurado para usar Neon.tech (PostgreSQL)")
print(f"🌐 Banco de dados: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Não configurado')}")

CORS(app)

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

# --- AUTH API ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'E-mail já cadastrado'}), 400
    
    user = User(name=data['name'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    login_user(user, remember=True)
    return jsonify(user.to_dict()), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    login_id = data.get('login') # can be email or name
    password = data.get('password')
    
    user = User.query.filter(or_(User.email == login_id, User.name == login_id)).first()
    
    if user and user.check_password(password):
        login_user(user, remember=True)
        return jsonify(user.to_dict())
    return jsonify({'error': 'Usuário ou senha incorretos'}), 401

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    if current_user.is_authenticated:
        return jsonify(current_user.to_dict())
    return jsonify({'error': 'Not authenticated'}), 401

# --- GENERIC HELPERS (Scoped by User) ---
def get_all_scoped(model):
    items = model.query.filter_by(user_id=current_user.id).all()
    return jsonify([item.to_dict() for item in items])

def delete_scoped(model, item_id):
    item = model.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True})

# --- SUBJECTS ---
@app.route('/api/subjects', methods=['GET'])
@login_required
def get_subjects(): return get_all_scoped(Subject)

@app.route('/api/subjects', methods=['POST'])
@login_required
def add_subject():
    data = request.json
    item = Subject(**data, user_id=current_user.id)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/api/subjects/<int:id>', methods=['PUT'])
@login_required
def update_subject(id):
    item = Subject.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    data = request.json
    for key, value in data.items():
        if key != 'user_id': setattr(item, key, value)
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/api/subjects/<int:id>', methods=['DELETE'])
@login_required
def del_subject(id): return delete_scoped(Subject, id)

# --- ACTIVITIES ---
@app.route('/api/activities', methods=['GET'])
@login_required
def get_activities(): return get_all_scoped(Activity)

@app.route('/api/activities', methods=['POST'])
@login_required
def add_activity():
    data = request.json
    item = Activity(**data, user_id=current_user.id)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/api/activities/<int:id>', methods=['PUT'])
@login_required
def update_activity(id):
    item = Activity.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    data = request.json
    for key, value in data.items():
        if key != 'user_id': setattr(item, key, value)
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/api/activities/<int:id>', methods=['DELETE'])
@login_required
def del_activity(id): return delete_scoped(Activity, id)

# --- SCHEDULES ---
@app.route('/api/schedules', methods=['GET'])
@login_required
def get_schedules(): return get_all_scoped(Schedule)

@app.route('/api/schedules', methods=['POST'])
@login_required
def add_schedule():
    import traceback
    try:
        data = request.json
        print(f"DEBUG: Received data: {data}")
        
        # Check if a batch of schedules is provided (for different times per day)
        if 'schedules' in data and isinstance(data['schedules'], list):
            created_items = []
            valid_keys = ['subject_id', 'title', 'day_of_week', 'start_time', 'end_time', 'location']
            for s_data in data['schedules']:
                # Clean and filter data
                filtered_data = {k: v for k, v in s_data.items() if k in valid_keys}
                
                # Defensive check: ensure subject_id is int or None
                sid = filtered_data.get('subject_id')
                if sid == "" or sid == "null" or sid == 0: filtered_data['subject_id'] = None
                elif sid is not None: filtered_data['subject_id'] = int(sid)
                
                # Ensure integers
                if 'day_of_week' in filtered_data:
                    filtered_data['day_of_week'] = int(filtered_data['day_of_week'])
                
                print(f"DEBUG: Creating Schedule with: {filtered_data}")
                item = Schedule(**filtered_data, user_id=current_user.id)
                db.session.add(item)
                created_items.append(item)
            
            db.session.commit()
            print("DEBUG: Commit successful")
            return jsonify([item.to_dict() for item in created_items]), 201
        
        days = data.get('day_of_week')
        if isinstance(days, list):
            created_items = []
            for day in days:
                item_data = {k: v for k, v in data.items() if k != 'day_of_week'}
                item_data['day_of_week'] = int(day)
                # Filter item_data
                valid_keys = ['subject_id', 'title', 'day_of_week', 'start_time', 'end_time', 'location']
                filtered_data = {k: v for k, v in item_data.items() if k in valid_keys}
                
                # Clean subject_id
                sid = filtered_data.get('subject_id')
                if sid == "" or sid == "null" or sid == 0: filtered_data['subject_id'] = None
                elif sid is not None: filtered_data['subject_id'] = int(sid)

                item = Schedule(**filtered_data, user_id=current_user.id)
                db.session.add(item)
                created_items.append(item)
            db.session.commit()
            return jsonify([item.to_dict() for item in created_items]), 201
        else:
            # Single item
            valid_keys = ['subject_id', 'title', 'day_of_week', 'start_time', 'end_time', 'location']
            filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            sid = filtered_data.get('subject_id')
            if sid == "" or sid == "null" or sid == 0: filtered_data['subject_id'] = None
            elif sid is not None: filtered_data['subject_id'] = int(sid)

            item = Schedule(**filtered_data, user_id=current_user.id)
            db.session.add(item)
            db.session.commit()
            return jsonify(item.to_dict()), 201
    except Exception as e:
        print("ERROR in add_schedule:")
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e), "trace": traceback.format_exc()}), 500

@app.route('/api/schedules/<int:id>', methods=['DELETE'])
@login_required
def del_schedule(id): return delete_scoped(Schedule, id)

# --- ABSENCES ---
@app.route('/api/absences', methods=['GET'])
@login_required
def get_absences(): return get_all_scoped(Absence)

@app.route('/api/absences', methods=['POST'])
@login_required
def add_absence():
    data = request.json
    item = Absence(**data, user_id=current_user.id)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/api/absences/<int:id>', methods=['DELETE'])
@login_required
def del_absence(id): return delete_scoped(Absence, id)

# --- GRADES ---
@app.route('/api/grades', methods=['GET'])
@login_required
def get_grades(): return get_all_scoped(Grade)

@app.route('/api/grades', methods=['POST'])
@login_required
def add_grade():
    data = request.json
    item = Grade(**data, user_id=current_user.id)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/api/grades/<int:id>', methods=['PUT'])
@login_required
def update_grade(id):
    item = Grade.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    data = request.json
    for key, value in data.items():
        if key != 'user_id': setattr(item, key, value)
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/api/grades/<int:id>', methods=['DELETE'])
@login_required
def del_grade(id): return delete_scoped(Grade, id)

# --- NOTES ---
@app.route('/api/notes', methods=['GET'])
@login_required
def get_notes():
    parent_type = request.args.get('parent_type')
    parent_id = request.args.get('parent_id')
    query = Note.query.filter_by(user_id=current_user.id)
    if parent_type: query = query.filter_by(parent_type=parent_type)
    if parent_id: query = query.filter_by(parent_id=int(parent_id))
    return jsonify([n.to_dict() for n in query.order_by(Note.id.desc()).all()])

@app.route('/api/notes', methods=['POST'])
@login_required
def add_note():
    from datetime import datetime
    data = request.json
    data['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M')
    item = Note(**data, user_id=current_user.id)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/api/notes/<int:id>', methods=['PUT'])
@login_required
def update_note(id):
    item = Note.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    data = request.json
    for key, value in data.items():
        if key != 'user_id': setattr(item, key, value)
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/api/notes/<int:id>', methods=['DELETE'])
@login_required
def del_note(id): return delete_scoped(Note, id)

# --- STUDY SESSIONS ---
@app.route('/api/study_sessions', methods=['GET'])
@login_required
def get_study_sessions(): return get_all_scoped(StudySession)

@app.route('/api/study_sessions', methods=['POST'])
@login_required
def add_study_session():
    data = request.json
    item = StudySession(**data, user_id=current_user.id)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/api/study_sessions/<int:id>', methods=['PUT'])
@login_required
def update_study_session(id):
    item = StudySession.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    data = request.json
    for key, value in data.items():
        if key != 'user_id': setattr(item, key, value)
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/api/study_sessions/<int:id>', methods=['DELETE'])
@login_required
def del_study_session(id): return delete_scoped(StudySession, id)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
