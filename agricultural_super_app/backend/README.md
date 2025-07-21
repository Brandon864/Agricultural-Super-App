# Agricultural Super App - Backend

This directory contains the Flask backend for the Agricultural Super App.

## Features

- User Authentication (Registration, Login, Profile Management)
- Blog/Post Management (Create, View, Update, Delete posts with images)
- Expert/Community Following
- Messaging System
- Comments and Likes on posts

## Technical Stack

- **Framework:** Flask
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy (with Flask-SQLAlchemy)
- **Migrations:** Flask-Migrate
- **Serialization:** Flask-Marshmallow
- **Authentication:** Flask-JWT-Extended
- **Testing:** `unittest` (Minitest) or `pytest`

## Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/agricultural_super_app.git
    cd agricultural_super_app/backend
    ```

2.  **Create a Virtual Environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Database Setup (PostgreSQL):**
    * Ensure PostgreSQL is running on your system.
    * Create a database and a user for your application.
        ```sql
        -- Connect to your PostgreSQL server (e.g., using psql)
        CREATE DATABASE your_database_name;
        CREATE USER your_db_user WITH PASSWORD 'your_db_password';
        GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_db_user;
        ```
    * **IMPORTANT:** Update `backend/.flaskenv` and `backend/instance/config.py` with your database credentials.

5.  **Environment Variables:**
    * Create a `.flaskenv` file in the `backend/` directory:
        ```env
        FLASK_APP=app.py
        FLASK_ENV=development
        # Add your database URI here. Example:
        DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/your_database_name"
        SECRET_KEY="your_super_secret_key_here" # Generate a strong, random key
        JWT_SECRET_KEY="your_jwt_secret_key_here" # Generate another strong, random key
        ```
    * `instance/config.py` should load these or provide overrides for production.

6.  **Run Database Migrations:**
    ```bash
    flask db init
    flask db migrate -m "Initial migration"
    flask db upgrade
    ```

7.  **Run the Flask Development Server:**
    ```bash
    flask run
    # Or, for auto-reloading:
    flask run --debug
    ```
    The API should be available at `http://localhost:5000` (or whatever port Flask defaults to).

## Testing

To run backend tests:

```bash
python -m unittest discover tests
# Or if using pytest (recommended for Minitest/unittest alternative)
pip install pytest pytest-flask
pytest
```
