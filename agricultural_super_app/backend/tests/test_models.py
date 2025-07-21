import unittest
from app import create_app
from extensions import db
from models import User, Post, Community, Follow, Comment, Like, Message
from datetime import datetime

class ModelsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['TESTING'] = True
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_user_model(self):
        with self.app.app_context():
            user = User(username='testuser', email='test@example.com', password_hash='hashed_pass')
            db.session.add(user)
            db.session.commit()
            self.assertIsNotNone(user.id)
            self.assertEqual(user.username, 'testuser')
            self.assertEqual(user.email, 'test@example.com')
            self.assertFalse(user.is_expert)

    def test_post_model(self):
        with self.app.app_context():
            user = User(username='post_author', email='post@example.com', password_hash='hashed_pass')
            db.session.add(user)
            db.session.commit()

            post = Post(title='My First Post', content='Hello world!', user_id=user.id)
            db.session.add(post)
            db.session.commit()
            self.assertIsNotNone(post.id)
            self.assertEqual(post.title, 'My First Post')
            self.assertEqual(post.author.username, 'post_author')

    def test_community_model(self):
        with self.app.app_context():
            admin_user = User(username='admin_user', email='admin@example.com', password_hash='hashed_pass')
            db.session.add(admin_user)
            db.session.commit()

            community = Community(name='AgriTech Innovations', description='Community for tech in agriculture', admin_id=admin_user.id)
            db.session.add(community)
            db.session.commit()
            self.assertIsNotNone(community.id)
            self.assertEqual(community.name, 'AgriTech Innovations')
            self.assertEqual(community.admin_id, admin_user.id)

    def test_follow_model(self):
        with self.app.app_context():
            user1 = User(username='user1', email='user1@example.com', password_hash='p1')
            user2 = User(username='user2', email='user2@example.com', password_hash='p2')
            db.session.add_all([user1, user2])
            db.session.commit()

            follow = Follow(follower_id=user1.id, followed_id=user2.id, followed_type='user')
            db.session.add(follow)
            db.session.commit()
            self.assertIsNotNone(follow.id)
            self.assertEqual(follow.follower_id, user1.id)
            self.assertEqual(follow.followed_id, user2.id)
            self.assertEqual(follow.followed_type, 'user')
            
            # Test unique constraint
            duplicate_follow = Follow(follower_id=user1.id, followed_id=user2.id, followed_type='user')
            db.session.add(duplicate_follow)
            with self.assertRaises(Exception): # Expecting an IntegrityError or similar
                db.session.commit()
            db.session.rollback() # Rollback to clear the error

    def test_comment_model(self):
        with self.app.app_context():
            user = User(username='commenter', email='c@example.com', password_hash='p')
            post_author = User(username='p_author', email='pa@example.com', password_hash='p')
            db.session.add_all([user, post_author])
            db.session.commit()

            post = Post(title='Test Post', content='Content', user_id=post_author.id)
            db.session.add(post)
            db.session.commit()

            comment = Comment(content='Great post!', user_id=user.id, post_id=post.id)
            db.session.add(comment)
            db.session.commit()
            self.assertIsNotNone(comment.id)
            self.assertEqual(comment.content, 'Great post!')
            self.assertEqual(comment.post.id, post.id)

    def test_like_model(self):
        with self.app.app_context():
            user = User(username='liker', email='l@example.com', password_hash='p')
            post_author = User(username='p_author', email='pa@example.com', password_hash='p')
            db.session.add_all([user, post_author])
            db.session.commit()

            post = Post(title='Test Post', content='Content', user_id=post_author.id)
            db.session.add(post)
            db.session.commit()

            like = Like(user_id=user.id, post_id=post.id)
            db.session.add(like)
            db.session.commit()
            self.assertIsNotNone(like.id)
            self.assertEqual(like.user_id, user.id)
            self.assertEqual(like.post_id, post.id)

            # Test unique constraint
            duplicate_like = Like(user_id=user.id, post_id=post.id)
            db.session.add(duplicate_like)
            with self.assertRaises(Exception): # Expecting an IntegrityError or similar
                db.session.commit()
            db.session.rollback()

    def test_message_model(self):
        with self.app.app_context():
            sender = User(username='sender', email='s@example.com', password_hash='p1')
            receiver = User(username='receiver', email='r@example.com', password_hash='p2')
            db.session.add_all([sender, receiver])
            db.session.commit()

            message = Message(sender_id=sender.id, receiver_id=receiver.id, content='Hello there!')
            db.session.add(message)
            db.session.commit()
            self.assertIsNotNone(message.id)
            self.assertEqual(message.content, 'Hello there!')
            self.assertEqual(message.sender_id, sender.id)
            self.assertEqual(message.receiver_id, receiver.id)
            self.assertFalse(message.is_read)


if __name__ == '__main__':
    unittest.main()
