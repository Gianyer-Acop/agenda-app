from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE subject ADD COLUMN emoji VARCHAR(10) DEFAULT '📚'"))
        db.session.commit()
        print("Migration applied successfully!")
    except Exception as e:
        print("Migration error:", e)
