import unittest
import json
from app import create_app
from extensions import db, bcrypt
from models import User, Post, Community, Follow, Comment, Like, Message
import os

class RoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # Use in-memory DB for tests
        self.app.config['TESTING'] = True
        self.app.config['JWT_SECRET_KEY'] = 'test_jwt_secret'
        self.app.config['SECRET_KEY'] = 'test_secret'
        self.app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'test_uploads') # For image uploads

        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            # Create a test user for authentication
            hashed_password = bcrypt.generate_password_hash('password').decode('utf-8')
            self.test_user = User(username='test_user', email='test@test.com', password_hash=hashed_password)
            db.session.add(self.test_user)
            db.session.commit()

            # Login to get a token for protected routes
            login_response = self.client.post(
                '/api/login',
                data=json.dumps({'username': 'test_user', 'password': 'password'}),
                content_type='application/json'
            )
            self.token = login_response.json['access_token']

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
        # Clean up test upload folder
        if os.path.exists(self.app.config['UPLOAD_FOLDER']):
            import shutil
            shutil.rmtree(self.app.config['UPLOAD_FOLDER'])

    # --- Test Post Routes ---
    def test_create_post(self):
        response = self.client.post(
            '/api/posts',
            data={'title': 'My Test Post', 'content': 'This is content'},
            headers={'Authorization': f'Bearer {self.token}'}
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('Post created successfully', response.json['message'])
        self.assertEqual(response.json['post']['title'], 'My Test Post')

    def test_get_posts(self):
        self.test_create_post() # Create a post first
        response = self.client.get('/api/posts')
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json), 0)
        self.assertEqual(response.json[0]['title'], 'My Test Post')

    def test_get_single_post(self):
        self.test_create_post()
        with self.app.app_context():
            post_id = Post.query.first().id
        
        response = self.client.get(f'/api/posts/{post_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['title'], 'My Test Post')

    # Add more tests for update, delete, communities, follow, message, comment, like routes...
    # (These will follow a similar pattern: authenticate, make request, assert status code and content)

    def test_update_post(self):
        self.test_create_post()
        with self.app.app_context():
            post_id = Post.query.first().id
        
        response = self.client.put(
            f'/api/posts/{post_id}',
            data=json.dumps({'title': 'Updated Post Title', 'content': 'Updated content'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('Updated Post Title', response.json['post']['title'])

    def test_delete_post(self):
        self.test_create_post()
        with self.app.app_context():
            post_id = Post.query.first().id
        
        response = self.client.delete(
            f'/api/posts/{post_id}',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        self.assertEqual(response.status_code, 204)
        
        # Verify it's deleted
        response = self.client.get(f'/api/posts/{post_id}')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()
