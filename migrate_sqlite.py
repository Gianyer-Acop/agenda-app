import sqlite3

try:
    db = sqlite3.connect('agenda.db')
    db.execute("ALTER TABLE subject ADD COLUMN emoji VARCHAR(10) DEFAULT '📚'")
    db.commit()
    print("Local SQLite database configured with 'emoji' column successfully.")
except Exception as e:
    print("SQLite migration note:", e)
