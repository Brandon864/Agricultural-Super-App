import os

class Config:
    # General Config
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess' # Should be loaded from .env
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'another-secret-jwt-key' # Should be loaded from .env

    # Database Config
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or                               'postgresql://user:password@localhost:5432/your_database_name'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Config
    JWT_ACCESS_TOKEN_EXPIRES = 3600 # 1 hour in seconds
    # JWT_REFRESH_TOKEN_EXPIRES = 86400 # 1 day

    # Uploads Config
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB limit for uploads
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
