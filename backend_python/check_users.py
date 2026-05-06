import sqlite3

def check_users():
    try:
        conn = sqlite3.connect('student_companion.db')
        cursor = conn.cursor()
        cursor.execute("SELECT name, email FROM users")
        users = cursor.fetchall()
        for user in users:
            print(f"Name: {user[0]}, Email: {user[1]}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
