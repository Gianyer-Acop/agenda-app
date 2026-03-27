import os
import psycopg2
from urllib.parse import urlparse

def get_neon_url():
    url = os.environ.get('NEON_DATABASE_URL')
    if not url:
        try:
            with open('.env') as f:
                for line in f:
                    if line.startswith('NEON_DATABASE_URL='):
                        return line.split('=', 1)[1].strip().strip('"').strip("'")
        except:
            pass
    return url

def migrate():
    url = get_neon_url()
    if not url:
        print("No NEON_DATABASE_URL found, skipping Neon migration.")
        return
    parsed = urlparse(url)
    try:
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path[1:],
            sslmode='require'
        )
        cur = conn.cursor()
        cur.execute("ALTER TABLE subject ADD COLUMN emoji VARCHAR(10) DEFAULT '📚'")
        conn.commit()
        print("Neon database configured with 'emoji' column successfully.")
    except Exception as e:
        print("Neon migration note:", e)

if __name__ == "__main__":
    migrate()
