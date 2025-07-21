from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
migrate = Migrate() # Initialized with app and db in create_app
jwt = JWTManager() # Initialized with app in create_app
ma = Marshmallow() # Initialized with app in create_app
bcrypt = Bcrypt() # Initialized with app in create_app
