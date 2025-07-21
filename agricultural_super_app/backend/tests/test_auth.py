import unittest
import json
from app import create_app
from extensions import db, bcrypt
from models import User
import os

class AuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        # Use a separate test database or in-memory SQLite for testing
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['TESTING'] = True
        self.app.config['JWT_SECRET_KEY'] = 'test_jwt_secret' # Use a distinct test secret
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_user_registration(self):
        response = self.client.post(
            '/api/register',
            data=json.dumps({
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('User registered successfully', response.json['message'])
        self.assertIn('user', response.json)

        # Test duplicate username
        response = self.client.post(
            '/api/register',
            data=json.dumps({
                'username': 'testuser',
                'email': 'another@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 409)
        self.assertIn('Username already exists', response.json['message'])

    def test_user_login(self):
        with self.app.app_context():
            hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
            user = User(username='loginuser', email='login@example.com', password_hash=hashed_password)
            db.session.add(user)
            db.session.commit()

        response = self.client.post(
            '/api/login',
            data=json.dumps({
                'username': 'loginuser',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.json)
        self.assertIn('user', response.json)

        # Test invalid password
        response = self.client.post(
            '/api/login',
            data=json.dumps({
                'username': 'loginuser',
                'password': 'wrongpassword'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn('Invalid credentials', response.json['message'])

    def test_get_profile_protected(self):
        # First, register and login to get a token
        self.client.post(
            '/api/register',
            data=json.dumps({
                'username': 'profileuser',
                'email': 'profile@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        login_response = self.client.post(
            '/api/login',
            data=json.dumps({
                'username': 'profileuser',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        token = login_response.json['access_token']

        response = self.client.get(
            '/api/profile',
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['username'], 'profileuser')

        # Test unauthorized access
        response = self.client.get('/api/profile')
        self.assertEqual(response.status_code, 401)


if __name__ == '__main__':
    unittest.main()
