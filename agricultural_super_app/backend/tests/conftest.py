# This file is typically used by pytest to discover shared fixtures.
# For example, a fixture to set up a test client or database session.

import pytest
from app import create_app
from extensions import db
from models import User # Import other models as needed
from flask_bcrypt import Bcrypt

@pytest.fixture(scope='session')
def flask_app():
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # Use in-memory for speed
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test_jwt_secret_for_pytest'
    app.config['SECRET_KEY'] = 'test_secret_for_pytest'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture(scope='function')
def client(flask_app):
    with flask_app.test_client() as client:
        yield client

@pytest.fixture(scope='function')
def authenticated_client(flask_app, client):
    with flask_app.app_context():
        # Create a user and get a token
        bcrypt = Bcrypt() # Initialize Bcrypt within app context for use
        hashed_password = bcrypt.generate_password_hash('password').decode('utf-8')
        user = User(username='pytest_user', email='pytest@example.com', password_hash=hashed_password)
        db.session.add(user)
        db.session.commit()
        
        login_response = client.post(
            '/api/login',
            data=json.dumps({'username': 'pytest_user', 'password': 'password'}),
            content_type='application/json'
        )
        token = login_response.json['access_token']
        
        client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        yield client
        
        # Clean up user after test
        db.session.delete(user)
        db.session.commit()
