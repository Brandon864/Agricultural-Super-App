from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, set_access_cookies, unset_jwt_cookies
from flask_cors import CORS
from datetime import timedelta
import os
import json # Ensure json is imported for likes/unlikes

# Initialize Flask App
app = Flask(__name__)

# --- CORS Configuration ---
# Allows requests from your React frontend (http://localhost:3000)
# Adjust origins in production or if your frontend runs on a different port/domain.
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# --- Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///agri_app.db' # Your database URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_super_secret_key_change_me') # Use environment variable or a strong default
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your_jwt_secret_key_change_me_too') # Use environment variable or a strong default
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1) # Token expiration time

# File Uploads Configuration
UPLOAD_FOLDER = 'uploads' # Folder where images will be saved
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max upload size: 16 MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Initialize Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # Relationships
    posts = db.relationship('Post', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='comment_author', lazy=True)
    marketplace_items = db.relationship('MarketplaceItem', backref='seller', lazy=True)
    community_memberships = db.relationship('CommunityMembership', back_populates='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    # community_id = db.Column(db.Integer, db.ForeignKey('community.id'), nullable=True) # Uncomment if posts belong to communities

    comments = db.relationship('Comment', backref='post', lazy=True, cascade="all, delete-orphan")
    likes = db.Column(db.String(1000), default='[]') # Stores JSON string of user IDs

    def to_dict(self):
        likes_list = []
        try:
            likes_list = json.loads(self.likes)
        except json.JSONDecodeError:
            pass
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'user_id': self.user_id,
            'author_username': self.author.username if self.author else None,
            'created_at': self.created_at.isoformat(),
            'likes': likes_list,
            # 'community_id': self.community_id, # Uncomment if posts belong to communities
            # 'community_name': self.community.name if self.community else None, # Uncomment if posts belong to communities
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    parent_comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True) # For nested comments
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy='dynamic', cascade="all, delete-orphan")
    likes = db.Column(db.String(1000), default='[]') # Stores JSON string of user IDs

    def to_dict(self):
        likes_list = []
        try:
            likes_list = json.loads(self.likes)
        except json.JSONDecodeError:
            pass
        return {
            'id': self.id,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'author_username': self.comment_author.username if self.comment_author else None,
            'text': self.text,
            'parent_comment_id': self.parent_comment_id,
            'created_at': self.created_at.isoformat(),
            'likes': likes_list
        }

class MarketplaceItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    contact_info = db.Column(db.String(255), nullable=True)
    image_url = db.Column(db.String(255), nullable=True) # To store path to image

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'user_id': self.user_id,
            'seller_username': self.seller.username if self.seller else None,
            'contact_info': self.contact_info,
            'image_url': self.image_url
        }

# Community Model
class Community(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    members = db.relationship('CommunityMembership', back_populates='community', lazy=True)
    # posts = db.relationship('Post', backref='community', lazy=True) # Uncomment if posts belong to communities

    def to_dict(self):
        member_ids = [member.user_id for member in self.members] # Collect only user_ids
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'owner_id': self.owner_id,
            'owner_username': self.community_owner.username if self.community_owner else None,
            'member_count': len(self.members),
            'members': member_ids # This passes the list of member IDs to the frontend
        }

# Association table for Many-to-Many relationship between User and Community
class CommunityMembership(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    community_id = db.Column(db.Integer, db.ForeignKey('community.id'), primary_key=True)
    joined_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', back_populates='community_memberships')
    community = db.relationship('Community', back_populates='members')

# Add owner relationship to Community model (can also be done as backref from User)
User.community_owned = db.relationship('Community', backref='community_owner', lazy=True, primaryjoin="User.id == Community.owner_id")


# --- Utility Functions ---
from werkzeug.utils import secure_filename

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- API Routes ---

# User Registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Missing username, email, or password'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully!'}), 201

# User Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        response = jsonify({
            'message': 'Logged in successfully!',
            'access_token': access_token,
            'user_id': user.id,
            'username': user.username
        })
        # If you want to use HttpOnly cookies for JWT (recommended for browser clients)
        # set_access_cookies(response, access_token) # Uncomment if you configure JWT to use cookies
        return response, 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# Get User Profile
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id) # Using .get() on the Query object is still valid but 2.0 recommends Session.get()

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
        # Add any other profile fields you want to expose
    }), 200

# Logout (if using HTTPOnly cookies, this would unset them)
@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"msg": "logout successful"})
    # If using set_access_cookies, you'd use unset_jwt_cookies here:
    # unset_jwt_cookies(response) # Uncomment if you configure JWT to use cookies
    return response, 200

# Image Upload Route
@app.route('/api/upload/image', methods=['POST'])
@jwt_required() # Require authentication for image uploads
def upload_image():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Generate a URL to access the uploaded image
        # This assumes your Flask app serves static files from the 'uploads' folder.
        # You might need to add a static_folder config or a static route if not default.
        image_url = f'http://localhost:5000/{app.config["UPLOAD_FOLDER"]}/{filename}'
        return jsonify({'message': 'File uploaded successfully', 'url': image_url}), 201
    else:
        return jsonify({'message': 'Invalid file type'}), 400

# --- Posts Routes ---
@app.route('/api/posts', methods=['GET'])
def get_all_posts():
    posts = Post.query.all()
    return jsonify([post.to_dict() for post in posts]), 200

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post_detail(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404
    return jsonify(post.to_dict()), 200

@app.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    user_id = get_jwt_identity() # Get current user's ID from JWT
    title = data.get('title')
    content = data.get('content')
    # community_id = data.get('community_id') # Uncomment if posts belong to communities

    if not title or not content:
        return jsonify({'message': 'Title and content are required'}), 400

    new_post = Post(title=title, content=content, user_id=user_id) # Removed community_id
    # if community_id: # Uncomment if posts belong to communities
    #    community = Community.query.get(community_id)
    #    if not community:
    #        return jsonify({'message': 'Community not found'}), 404
    #    new_post.community_id = community_id

    db.session.add(new_post)
    db.session.commit()
    return jsonify(new_post.to_dict()), 201

# Post Like/Unlike
@app.route('/api/posts/<int:post_id>/like', methods=['POST', 'DELETE'])
@jwt_required()
def handle_post_like(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404

    user_id = get_jwt_identity() # Get as integer
    likes = json.loads(post.likes) # Parse current likes (will be integers)

    if request.method == 'POST':
        if user_id not in likes: # Comparison of integers
            likes.append(user_id)
            post.likes = json.dumps(likes)
            db.session.commit()
            return jsonify({"message": "Post liked successfully", "likes_count": len(likes)}), 200
        return jsonify({"message": "Post already liked"}), 409
    elif request.method == 'DELETE':
        if user_id in likes: # Comparison of integers
            likes.remove(user_id)
            post.likes = json.dumps(likes)
            db.session.commit()
            return jsonify({"message": "Post unliked successfully", "likes_count": len(likes)}), 200
        return jsonify({"message": "Post not liked by user"}), 409


# --- Comments Routes ---
@app.route('/api/posts/<int:post_id>/comments', methods=['GET'])
def get_comments_for_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404

    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    return jsonify([comment.to_dict() for comment in comments]), 200

@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment_to_post(post_id):
    data = request.get_json()
    user_id = get_jwt_identity()
    text = data.get('text')
    parent_comment_id = data.get('parent_comment_id') # Get parent_comment_id

    if not text:
        return jsonify({'message': 'Comment text is required'}), 400

    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404

    # Validate parent_comment_id if provided
    if parent_comment_id:
        parent_comment = Comment.query.get(parent_comment_id)
        if not parent_comment or parent_comment.post_id != post_id:
            return jsonify({'message': 'Invalid parent comment ID for this post'}), 400

    new_comment = Comment(
        post_id=post_id,
        user_id=user_id,
        text=text,
        parent_comment_id=parent_comment_id # Assign parent_comment_id
    )
    db.session.add(new_comment)
    db.session.commit()

    return jsonify(new_comment.to_dict()), 201

# Comment Like/Unlike
@app.route('/api/comments/<int:comment_id>/like', methods=['POST', 'DELETE'])
@jwt_required()
def handle_comment_like(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"message": "Comment not found"}), 404

    user_id = get_jwt_identity() # Get as integer
    likes = json.loads(comment.likes) # Parse current likes (will be integers)

    if request.method == 'POST':
        if user_id not in likes: # Comparison of integers
            likes.append(user_id)
            comment.likes = json.dumps(likes)
            db.session.commit()
            return jsonify({"message": "Comment liked successfully", "likes_count": len(likes)}), 200
        return jsonify({"message": "Comment already liked"}), 409
    elif request.method == 'DELETE':
        if user_id in likes: # Comparison of integers
            likes.remove(user_id)
            comment.likes = json.dumps(likes)
            db.session.commit()
            return jsonify({"message": "Comment unliked successfully", "likes_count": len(likes)}), 200
        return jsonify({"message": "Comment not liked by user"}), 409


# --- Marketplace Routes ---
@app.route('/api/marketplace/items', methods=['GET'])
def get_all_marketplace_items():
    items = MarketplaceItem.query.all()
    return jsonify([item.to_dict() for item in items]), 200

@app.route('/api/marketplace/items/<int:item_id>', methods=['GET'])
def get_marketplace_item_detail(item_id):
    item = MarketplaceItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404
    return jsonify(item.to_dict()), 200

@app.route('/api/marketplace/items', methods=['POST'])
@jwt_required()
def create_marketplace_item():
    data = request.get_json()
    user_id = get_jwt_identity()
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    contact_info = data.get('contact_info')
    image_url = data.get('image_url') # Assuming frontend sends URL if image already uploaded

    if not name or price is None:
        return jsonify({'message': 'Name and price are required'}), 400

    new_item = MarketplaceItem(
        name=name,
        description=description,
        price=price,
        user_id=user_id,
        contact_info=contact_info,
        image_url=image_url
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

# --- Community Routes ---
@app.route('/api/communities', methods=['GET'])
def get_all_communities():
    communities = Community.query.all()
    return jsonify([c.to_dict() for c in communities]), 200

@app.route('/api/communities/<int:community_id>', methods=['GET'])
def get_community_detail(community_id):
    community = Community.query.get(community_id)
    if not community:
        return jsonify({"message": "Community not found"}), 404
    return jsonify(community.to_dict()), 200

@app.route('/api/communities', methods=['POST'])
@jwt_required()
def create_community():
    data = request.get_json()
    user_id = get_jwt_identity() # The creator is the owner
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({'message': 'Community name is required'}), 400
    if Community.query.filter_by(name=name).first():
        return jsonify({'message': 'Community with this name already exists'}), 409

    new_community = Community(name=name, description=description, owner_id=user_id)
    db.session.add(new_community)
    db.session.commit()

    # Automatically make the creator a member of the community
    membership = CommunityMembership(user_id=user_id, community_id=new_community.id)
    db.session.add(membership)
    db.session.commit()

    return jsonify(new_community.to_dict()), 201

@app.route('/api/communities/<int:community_id>/join', methods=['POST'])
@jwt_required()
def join_community(community_id):
    user_id = get_jwt_identity()
    community = Community.query.get(community_id)

    if not community:
        return jsonify({"message": "Community not found"}), 404

    # Check if user is already a member
    existing_membership = CommunityMembership.query.filter_by(
        user_id=user_id,
        community_id=community_id
    ).first()

    if existing_membership:
        return jsonify({"message": "Already a member of this community"}), 409

    new_membership = CommunityMembership(user_id=user_id, community_id=community_id)
    db.session.add(new_membership)
    db.session.commit()

    return jsonify({"message": "Successfully joined community", "community_id": community.id}), 200

@app.route('/api/communities/<int:community_id>/leave', methods=['POST']) # Or DELETE method
@jwt_required()
def leave_community(community_id):
    user_id = get_jwt_identity()
    community = Community.query.get(community_id)

    if not community:
        return jsonify({"message": "Community not found"}), 404

    membership = CommunityMembership.query.filter_by(
        user_id=user_id,
        community_id=community_id
    ).first()

    if not membership:
        return jsonify({"message": "Not a member of this community"}), 409

    db.session.delete(membership)
    db.session.commit()

    return jsonify({"message": "Successfully left community", "community_id": community.id}), 200


# --- Run App ---
if __name__ == '__main__':
    with app.app_context():
        # IMPORTANT: If you are using flask db migrate/upgrade for schema changes,
        # you might comment out db.create_all() after the first setup,
        # as migrations handle table creation/updates.
        db.create_all() # Ensure all tables, including new ones, are created
    app.run(debug=True, port=5000)