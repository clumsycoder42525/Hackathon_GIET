import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def add_user():
    try:
        conn = sqlite3.connect('student_companion.db')
        cursor = conn.cursor()
        
        # Check if admin already exists
        cursor.execute("SELECT id FROM users WHERE email='admin@example.com'")
        if cursor.fetchone():
            print("Admin already exists.")
            return

        hashed_password = pwd_context.hash("admin123")
        cursor.execute("INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)", 
                       ("Admin User", "admin@example.com", hashed_password))
        conn.commit()
        print("User admin@example.com created with password: admin123")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_user()
