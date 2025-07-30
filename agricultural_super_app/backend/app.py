import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta
from werkzeug.utils import secure_filename
from sqlalchemy import or_
import json
from urllib.parse import quote_plus # Import quote_plus for URL encoding

# Import specific JWT exceptions for explicit handling
from flask_jwt_extended.exceptions import NoAuthorizationError, InvalidHeaderError, RevokedTokenError
from jwt.exceptions import PyJWTError, DecodeError, ExpiredSignatureError

# Import and load dotenv at the very beginning
from dotenv import load_dotenv
load_dotenv() # This loads the environment variables from .env file

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")

# --- Configuration ---
CORS(app, resources={r"/api/*": {"origins": os.environ.get("FRONTEND_URL", "*")}})

# Database URI configuration for deployment
# It uses the DATABASE_URL environment variable, falling back to SQLite for local development if not set.
db_url = os.environ.get("DATABASE_URL", "sqlite:///agri_app.db")

# --- URL-encode password if present in the DATABASE_URL ---
# This helps with special characters in passwords that might cause parsing issues.
if "@" in db_url and "://" in db_url:
    parts = db_url.split("://", 1)
    scheme = parts[0]
    credentials_and_host = parts[1]

    if "@" in credentials_and_host:
        auth_part, host_part = credentials_and_host.split("@", 1)
        if ":" in auth_part:
            username, password = auth_part.split(":", 1)
            # Only encode the password part
            encoded_password = quote_plus(password)
            db_url = f"{scheme}://{username}:{encoded_password}@{host_part}"
        # If no colon in auth_part, it means no password, so no encoding needed for that part
    # If no @ in credentials_and_host, it means no username/password, so no encoding needed for that part

# Replace postgres:// with postgresql:// for SQLAlchemy compatibility with Heroku/Render
app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace("postgres://", "postgresql://")

# --- Diagnostic Print Statement for DATABASE_URL ---
# This will print the exact DATABASE_URL being used by Flask, which is crucial for debugging.
print(f"DEBUG: Flask app is using DATABASE_URL: {app.config['SQLALCHEMY_DATABASE_URI']}")


app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# Ensure these keys are loaded from environment variables (e.g., from .env)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "your_super_secret_key_change_me_in_production")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your_jwt_secret_key_change_me_too_in_production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

# File Upload Setup
basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# Initialize Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Flask-JWT-Extended Error Handlers ---
@jwt.unauthorized_loader
def unauthorized_response(callback):
    app.logger.warning(f"JWT Unauthorized: {callback}")
    return jsonify({"message": "Missing Authorization Header"}), 401

@jwt.invalid_token_loader
def invalid_token_response(callback):
    app.logger.warning(f"JWT Invalid Token: {callback}")
    return jsonify({"message": "Signature verification failed"}), 401

@jwt.expired_token_loader
def expired_token_response(callback):
    app.logger.warning(f"JWT Expired Token: {callback}")
    # Return 401 for expired tokens, as per common practice for authentication failures
    return jsonify({"message": "Token has expired"}), 401

@jwt.revoked_token_loader
def revoked_token_response(callback):
    app.logger.warning(f"JWT Revoked Token: {callback}")
    return jsonify({"message": "Token has been revoked"}), 401

@jwt.needs_fresh_token_loader
def needs_fresh_token_response(callback):
    app.logger.warning(f"JWT Needs Fresh Token: {callback}")
    return jsonify({"message": "Fresh token required"}), 401

# Generic handler for other PyJWT errors that might not be caught by specific JWT-Extended handlers
@app.errorhandler(PyJWTError)
def handle_jwt_error(e):
    app.logger.error(f"A general PyJWTError occurred: {e}")
    # Check for specific PyJWT errors and return appropriate status codes
    if isinstance(e, ExpiredSignatureError):
        return jsonify({"message": "Token has expired"}), 401
    elif isinstance(e, DecodeError):
        return jsonify({"message": "Token decoding failed (e.g., malformed token)"}), 401
    else:
        return jsonify({"message": f"JWT Error: {str(e)}"}), 401


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    bio = db.Column(db.Text, nullable=True, default="")
    profile_picture_url = db.Column(db.String(255), nullable=True)

    posts = db.relationship("Post", backref="author", lazy=True, cascade="all, delete-orphan")
    comments = db.relationship("Comment", backref="comment_author", lazy=True, cascade="all, delete-orphan")
    marketplace_items = db.relationship("MarketplaceItem", backref="seller", lazy=True, cascade="all, delete-orphan")
    community_memberships = db.relationship("CommunityMembership", back_populates="user", lazy=True, cascade="all, delete-orphan")
    community_owned = db.relationship("Community", backref="community_owner", lazy=True, foreign_keys="Community.owner_id")
    following = db.relationship(
        "Follow", foreign_keys="Follow.follower_id", backref=db.backref("follower_user", lazy=True),
        lazy="dynamic", cascade="all, delete-orphan"
    )
    followers = db.relationship(
        "Follow", foreign_keys="Follow.followed_id", backref=db.backref("followed_user", lazy=True),
        lazy="dynamic", cascade="all, delete-orphan"
    )
    sent_messages = db.relationship("Message", foreign_keys="Message.sender_id", backref="sender", lazy=True)
    received_messages = db.relationship("Message", foreign_keys="Message.receiver_id", backref="receiver", lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id, "username": self.username, "email": self.email, "bio": self.bio,
            "profile_picture_url": self.profile_picture_url
        }

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    image_url = db.Column(db.String(255), nullable=True)
    community_id = db.Column(db.Integer, db.ForeignKey("community.id"), nullable=True)

    comments = db.relationship("Comment", backref="post", lazy=True, cascade="all, delete-orphan")
    community = db.relationship("Community", backref="posts")
    likes = db.Column(db.Text, default="[]")

    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "content": self.content, "user_id": self.user_id,
            "author_username": self.author.username if self.author else None,
            "created_at": self.created_at.isoformat(),
            "likes": json.loads(self.likes),
            "image_url": self.image_url, "community_id": self.community_id
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    parent_comment_id = db.Column(db.Integer, db.ForeignKey("comment.id"), nullable=True)

    replies = db.relationship("Comment", backref=db.backref("parent", remote_side=[id]), lazy="dynamic", cascade="all, delete-orphan")
    likes = db.Column(db.Text, default="[]")

    def to_dict(self):
        return {
            "id": self.id, "post_id": self.post_id, "user_id": self.user_id,
            "author_username": self.comment_author.username if self.comment_author else None,
            "text": self.text, "parent_comment_id": self.parent_comment_id,
            "created_at": self.created_at.isoformat(),
            "likes": json.loads(self.likes)
        }

class MarketplaceItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    contact_info = db.Column(db.String(255), nullable=True)
    image_url = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "description": self.description, "price": self.price,
            "user_id": self.user_id, "seller_username": self.seller.username if self.seller else None,
            "contact_info": self.contact_info, "image_url": self.image_url
        }

class Community(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    members = db.relationship("CommunityMembership", back_populates="community", lazy=True, cascade="all, delete-orphan")
    messages = db.relationship("Message", foreign_keys="Message.community_id", backref="community_chat", lazy=True)

    def to_dict(self):
        community_posts = [post.to_dict() for post in self.posts]
        community_posts.sort(key=lambda x: x["created_at"], reverse=True)
        return {
            "id": self.id, "name": self.name, "description": self.description,
            "created_at": self.created_at.isoformat(), "owner_id": self.owner_id,
            "owner_username": self.community_owner.username if self.community_owner else None,
            "member_count": len(self.members),
        }

class CommunityMembership(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    community_id = db.Column(db.Integer, db.ForeignKey("community.id"), primary_key=True)
    joined_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship("User", back_populates="community_memberships")
    community = db.relationship("Community", back_populates="members")

class Follow(db.Model):
    __tablename__ = "follows"
    follower_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    followed_type = db.Column(db.String(20), nullable=False, default="user")
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            "follower_id": self.follower_id, "followed_id": self.followed_id,
            "followed_type": self.followed_type, "timestamp": self.timestamp.isoformat()
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    community_id = db.Column(db.Integer, db.ForeignKey("community.id"), nullable=True)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_read = db.Column(db.Boolean, default=False)

    def to_dict(self):
        sender_username = self.sender.username if self.sender else None
        receiver_username = self.receiver.username if self.receiver else None
        community_name = self.community_chat.name if self.community_chat else None

        return {
            "id": self.id, "sender_id": self.sender_id, "sender_username": sender_username,
            "receiver_id": self.receiver_id, "receiver_username": receiver_username,
            "community_id": self.community_id, "community_name": community_name,
            "text": self.text, "timestamp": self.timestamp.isoformat(), "is_read": self.is_read
        }

# --- Authentication Routes ---
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username, email, password = data.get("username"), data.get("email"), data.get("password")
    if not all([username, email, password]):
        return jsonify({"message": "Missing username, email, or password"}), 400
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"message": "Username or email already exists"}), 409
    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username, password = data.get("username"), data.get("password")
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"message": "Logged in successfully!", "access_token": access_token, "user": user.to_dict()}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/api/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({"message": "Logout successful (client-side token deletion recommended)"}), 200

@app.route("/api/verify_token", methods=["GET"])
@jwt_required()
def verify_token():
    user = db.session.get(User, int(get_jwt_identity()))
    if user:
        return jsonify({"message": "Token is valid", "user": user.to_dict()}), 200
    return jsonify({"message": "Invalid token or user not found"}), 401

# --- User Profile Routes ---
@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict()), 200

@app.route("/api/profile", methods=["PUT"])
@jwt_required()
def update_user_profile():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"message": "User not found"}), 404
    updated = False

    if request.mimetype == "application/json":
        data = request.get_json()
        new_username = data.get("username")
        new_email = data.get("email")
        new_password = data.get("password")
        new_bio = data.get("bio")
        new_profile_picture_url = data.get("profile_picture_url")
    else:
        new_username = request.form.get("username")
        new_email = request.form.get("email")
        new_password = request.form.get("password")
        new_bio = request.form.get("bio")
        new_profile_picture_url = None

    if "profile_picture" in request.files:
        file = request.files["profile_picture"]
        if file.filename != "" and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            try:
                file.save(filepath)
                new_profile_picture_url = f"/uploads/{filename}"
                if new_profile_picture_url != user.profile_picture_url:
                    user.profile_picture_url = new_profile_picture_url
                    updated = True
            except Exception as e:
                app.logger.error(f"Failed to save profile picture: {e}")
                return jsonify({"message": "Failed to save profile picture"}), 500
        else:
            return jsonify({"message": "Invalid profile picture file type"}), 400
    elif new_profile_picture_url is not None:
        if new_profile_picture_url != user.profile_picture_url:
            user.profile_picture_url = new_profile_picture_url
            updated = True

    if new_username is not None and new_username != user.username:
        if User.query.filter_by(username=new_username).first():
            return jsonify({"message": "Username already taken"}), 409
        user.username = new_username
        updated = True
    if new_email is not None and new_email != user.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({"message": "Email already taken"}), 409
        user.email = new_email
        updated = True
    if new_bio is not None and new_bio != user.bio:
        user.bio = new_bio
        updated = True
    if new_password:
        user.set_password(new_password)
        updated = True

    if updated:
        db.session.commit()
        return jsonify({"message": "Profile updated successfully!", "user": user.to_dict()}), 200
    return jsonify({"message": "No changes provided or nothing to update", "user": user.to_dict()}), 200

@app.route("/api/users/<int:user_id>", methods=["GET"])
@jwt_required(optional=True)
def get_user_by_id(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user_data = user.to_dict()
    user_data["followers_count"] = user.followers.count()
    user_data["following_users_count"] = user.following.filter_by(followed_type="user").count()
    user_data["following_communities_count"] = user.following.filter_by(followed_type="community").count()
    current_viewer_id = get_jwt_identity()
    user_data["is_followed_by_current_user"] = False
    if current_viewer_id and int(current_viewer_id) != user_id:
        user_data["is_followed_by_current_user"] = db.session.query(Follow).filter_by(
            follower_id=int(current_viewer_id), followed_id=user_id, followed_type="user"
        ).first() is not None
    return jsonify(user_data), 200

@app.route("/api/users", methods=["GET"])
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@app.route("/api/users/<int:user_id>/posts", methods=["GET"])
def get_posts_by_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    posts_data = [post.to_dict() for post in posts]
    return jsonify(posts_data), 200

@app.route("/api/users/<int:user_id>/joined_communities", methods=["GET"])
def get_communities_user_joined(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    joined_memberships = CommunityMembership.query.filter_by(user_id=user_id).all()
    joined_communities_data = []
    for membership in joined_memberships:
        community = membership.community
        if community:
            joined_communities_data.append({
                "id": community.id, "name": community.name, "description": community.description, "owner_id": community.owner_id
            })
    return jsonify(joined_communities_data), 200

# --- Post Routes ---
@app.route("/api/posts", methods=["GET"])
def get_all_posts():
    posts = Post.query.all()
    posts_data = [post.to_dict() for post in posts]
    posts_data.sort(key=lambda x: x["created_at"], reverse=True)
    return jsonify(posts_data), 200

@app.route("/api/posts/<int:post_id>", methods=["GET"])
def get_post_detail(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404
    return jsonify(post.to_dict()), 200

@app.route("/api/posts", methods=["POST"])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    if request.mimetype == "application/json":
        data = request.get_json()
        title, content, community_id = data.get("title"), data.get("content"), data.get("community_id")
    else:
        title, content = request.form.get("title"), request.form.get("content")
        community_id = int(request.form.get("community_id")) if request.form.get("community_id") else None

    if not all([title, content]):
        return jsonify({"message": "Title and content are required"}), 400
    if community_id is not None and not db.session.get(Community, community_id):
        return jsonify({"message": "Community not found"}), 404

    image_url = None
    if "image" in request.files:
        file = request.files["image"]
        if file.filename != "" and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            try:
                file.save(filepath)
                image_url = f"/uploads/{filename}"
            except Exception as e:
                app.logger.error(f"Failed to save post image: {e}")
                return jsonify({"message": "Failed to save image"}), 500
        else:
            return jsonify({"message": "Invalid image file type"}), 400
    new_post = Post(title=title, content=content, user_id=int(user_id), image_url=image_url, community_id=community_id)
    db.session.add(new_post)
    db.session.commit()
    return jsonify(new_post.to_dict()), 201

@app.route("/api/posts/<int:post_id>/like", methods=["POST", "DELETE"])
@jwt_required()
def handle_post_like(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404
    user_id = int(get_jwt_identity())
    likes = json.loads(post.likes)
    if request.method == "POST":
        if user_id not in likes:
            likes.append(user_id)
            post.likes = json.dumps(likes)
            db.session.commit()
            return jsonify({"message": "Post liked successfully", "likes_count": len(likes)}), 200
        return jsonify({"message": "Post already liked"}), 409
    elif request.method == "DELETE":
        if user_id in likes:
            likes.remove(user_id)
            post.likes = json.dumps(likes)
            db.session.commit()
            return jsonify({"message": "Post unliked successfully", "likes_count": len(likes)}), 200
        return jsonify({"message": "Post not liked by user"}), 409

# --- Comment Routes ---
@app.route("/api/posts/<int:post_id>/comments", methods=["GET"])
def get_comments_for_post(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404
    comments = Comment.query.filter_by(post_id=post_id, parent_comment_id=None).order_by(Comment.created_at.asc()).all()
    return jsonify([comment.to_dict() for comment in comments]), 200

@app.route("/api/comments/<int:comment_id>/replies", methods=["GET"])
def get_replies_for_comment(comment_id):
    parent_comment = db.session.get(Comment, comment_id)
    if not parent_comment:
        return jsonify({"message": "Parent comment not found"}), 404
    replies = parent_comment.replies.order_by(Comment.created_at.asc()).all()
    return jsonify([reply.to_dict() for reply in replies]), 200

@app.route("/api/posts/<int:post_id>/comments", methods=["POST"])
@jwt_required()
def add_comment_to_post(post_id):
    data = request.get_json()
    user_id, text, parent_comment_id = get_jwt_identity(), data.get("text"), data.get("parent_comment_id")
    if not text:
        return jsonify({"message": "Comment text is required"}), 400
    if not db.session.get(Post, post_id):
        return jsonify({"message": "Post not found"}), 404
    if parent_comment_id and (not db.session.get(Comment, parent_comment_id) or db.session.get(Comment, parent_comment_id).post_id != post_id):
        return jsonify({"message": "Invalid parent comment ID for this post"}), 400
    new_comment = Comment(post_id=post_id, user_id=int(user_id), text=text, parent_comment_id=parent_comment_id)
    db.session.add(new_comment)
    db.session.commit()
    return jsonify(new_comment.to_dict()), 201

@app.route("/api/comments/<int:comment_id>/like", methods=["POST", "DELETE"])
@jwt_required()
def handle_comment_like(comment_id):
    comment = db.session.get(Comment, comment_id)
    if not comment:
        return jsonify({"message": "Comment not found"}), 404
    user_id = int(get_jwt_identity())
    likes = json.loads(comment.likes)
    if request.method == "POST":
        if user_id not in likes:
            likes.append(user_id)
            comment.likes = json.dumps(likes)
            db.session.commit()
            return jsonify({"message": "Comment liked successfully", "likes_count": len(likes)}), 200
        return jsonify({"message": "Comment already liked"}), 409
    elif request.method == "DELETE":
        if user_id in likes:
            likes.remove(user_id)
            comment.likes = json.dumps(likes)
            db.session.commit()
            return jsonify({"message": "Comment unliked successfully", "likes_count": len(likes)}), 200
        return jsonify({"message": "Comment not liked by user"}), 409

# --- Marketplace Routes ---
@app.route("/api/marketplace/items", methods=["GET"])
def get_all_marketplace_items():
    items = MarketplaceItem.query.all()
    return jsonify([item.to_dict() for item in items]), 200

@app.route("/api/marketplace/items/<int:item_id>", methods=["GET"])
def get_marketplace_item_detail(item_id):
    item = db.session.get(MarketplaceItem, item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404
    return jsonify(item.to_dict()), 200

@app.route("/api/marketplace/items", methods=["POST"])
@jwt_required()
def create_marketplace_item():
    user_id = get_jwt_identity()
    name = request.form.get("name") if request.form else request.json.get("name")
    description = request.form.get("description") if request.form else request.json.get("description")
    price = request.form.get("price") if request.form else request.json.get("price")
    contact_info = request.form.get("contact_info") if request.form else request.json.get("contact_info")

    try:
        price = float(price)
    except (TypeError, ValueError):
        return jsonify({"message": "Price must be a valid number"}), 400
    if not name or price is None:
        return jsonify({"message": "Name and price are required"}), 400

    image_url = None
    if "image" in request.files:
        file = request.files["image"]
        if file.filename != "" and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            try:
                file.save(filepath)
                image_url = f"/uploads/{filename}"
            except Exception as e:
                app.logger.error(f"Failed to save marketplace item image: {e}")
                return jsonify({"message": "Failed to save image"}), 500
        else:
            return jsonify({"message": "Invalid image file type"}), 400
    new_item = MarketplaceItem(name=name, description=description, price=price, user_id=int(user_id),
                               contact_info=contact_info, image_url=image_url)
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

# --- Community Routes ---
@app.route("/api/communities", methods=["GET"])
def get_all_communities():
    communities = Community.query.all()
    return jsonify([c.to_dict() for c in communities]), 200

@app.route("/api/communities/<int:community_id>", methods=["GET"])
def get_community_detail(community_id):
    community = db.session.get(Community, community_id)
    if not community:
        return jsonify({"message": "Community not found"}), 404
    return jsonify(community.to_dict()), 200

@app.route("/api/communities", methods=["POST"])
@jwt_required()
def create_community():
    data = request.get_json()
    user_id, name, description = get_jwt_identity(), data.get("name"), data.get("description")
    if not name:
        return jsonify({"message": "Community name is required"}), 400
    if Community.query.filter_by(name=name).first():
        return jsonify({"message": "Community with this name already exists"}), 409
    new_community = Community(name=name, description=description, owner_id=int(user_id))
    db.session.add(new_community)
    db.session.commit()
    membership = CommunityMembership(user_id=int(user_id), community_id=new_community.id)
    db.session.add(membership)
    db.session.commit()
    return jsonify(new_community.to_dict()), 201

@app.route("/api/communities/<int:community_id>/join", methods=["POST"])
@jwt_required()
def join_community(community_id):
    user_id = get_jwt_identity()
    community = db.session.get(Community, community_id)
    if not community:
        return jsonify({"message": "Community not found"}), 404
    if CommunityMembership.query.filter_by(user_id=int(user_id), community_id=community_id).first():
        return jsonify({"message": "Already a member of this community"}), 409
    new_membership = CommunityMembership(user_id=int(user_id), community_id=community_id)
    db.session.add(new_membership)
    db.session.commit()
    return jsonify({"message": "Successfully joined community", "community_id": community.id, "current_user_id": int(user_id)}), 200

@app.route("/api/communities/<int:community_id>/leave", methods=["POST"])
@jwt_required()
def leave_community(community_id):
    user_id = get_jwt_identity()
    community = db.session.get(Community, community_id)
    if not community:
        return jsonify({"message": "Community not found"}), 404
    membership = CommunityMembership.query.filter_by(user_id=int(user_id), community_id=community_id).first()
    if not membership:
        return jsonify({"message": "Not a member of this community"}), 409
    if community.owner_id == int(user_id):
        return jsonify({"message": "Community owner cannot leave their own community without deleting it"}), 403
    db.session.delete(membership)
    db.session.commit()
    return jsonify({"message": "Successfully left community", "community_id": community.id, "current_user_id": int(user_id)}), 200

@app.route("/api/communities/<int:community_id>/posts", methods=["GET"])
def get_community_posts(community_id):
    community = db.session.get(Community, community_id)
    if not community:
        return jsonify({"message": "Community not found"}), 404
    posts = Post.query.filter_by(community_id=community_id).order_by(Post.created_at.desc()).all()
    posts_data = [post.to_dict() for post in posts]
    return jsonify(posts_data), 200

# --- Follow Routes (Users) ---
@app.route("/api/users/<int:user_id>/follow", methods=["POST"])
@jwt_required()
def follow_user(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id == user_id:
        return jsonify({"message": "You cannot follow yourself"}), 400
    if not db.session.get(User, user_id):
        return jsonify({"message": "User not found"}), 404
    if Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id, followed_type="user").first():
        return jsonify({"message": "Already following this user"}), 409
    new_follow = Follow(follower_id=current_user_id, followed_id=user_id, followed_type="user")
    db.session.add(new_follow)
    db.session.commit()
    followed_user = db.session.get(User, user_id)
    return jsonify({"message": f"Successfully followed {followed_user.username}", "current_user_id": current_user_id}), 200

@app.route("/api/users/<int:user_id>/unfollow", methods=["DELETE"])
@jwt_required()
def unfollow_user(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id == user_id:
        return jsonify({"message": "You cannot unfollow yourself"}), 400
    if not db.session.get(User, user_id):
        return jsonify({"message": "User not found"}), 404
    follow_record = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id, followed_type="user").first()
    if not follow_record:
        return jsonify({"message": "Not currently following this user"}), 409
    db.session.delete(follow_record)
    db.session.commit()
    unfollowed_user = db.session.get(User, user_id)
    return jsonify({"message": f"Successfully unfollowed {unfollowed_user.username}", "current_user_id": current_user_id}), 200

@app.route("/api/users/<int:user_id>/followers", methods=["GET"])
def get_user_followers(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    followers = [{"id": f.follower_user.id, "username": f.follower_user.username} for f in user.followers.filter_by(followed_type="user")]
    return jsonify(followers), 200

@app.route("/api/users/<int:user_id>/following", methods=["GET"])
def get_user_following(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    following = [{"id": f.followed_user.id, "username": f.followed_user.username} for f in user.following.filter_by(followed_type="user")]
    return jsonify(following), 200

@app.route("/api/users/<int:user_id>/is_following", methods=["GET"])
@jwt_required(optional=True)
def is_following(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id == user_id:
        return jsonify({"is_following": False, "message": "Cannot follow self"}), 200
    is_following_user = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id, followed_type="user").first() is not None
    return jsonify({"is_following": is_following_user}), 200

# --- Search Routes ---
@app.route("/api/search/users", methods=["GET"])
def search_users():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"message": "Please provide a search query"}), 400
    users = User.query.filter(User.username.ilike(f"%{query}%")).all()
    return jsonify([user.to_dict() for user in users]), 200

@app.route("/api/search/communities", methods=["GET"])
def search_communities():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"message": "Please provide a search query"}), 400
    communities = Community.query.filter(
        (Community.name.ilike(f"%{query}%")) | (Community.description.ilike(f"%{query}%"))
    ).all()
    return jsonify([community.to_dict() for c in communities]), 200

@app.route("/api/search/posts", methods=["GET"])
def search_posts():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"message": "Please provide a search query"}), 400
    posts = Post.query.filter(
        (Post.title.ilike(f"%{query}%")) | (Post.content.ilike(f"%{query}%"))
    ).all()
    posts_data = [post.to_dict() for post in posts]
    posts_data.sort(key=lambda x: x["created_at"], reverse=True)
    return jsonify(posts_data), 200

# --- Messaging Routes ---
@app.route("/api/messages", methods=["POST"])
@jwt_required()
def send_message():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    receiver_id = data.get("receiver_id")
    community_id = data.get("community_id")
    text = data.get("text")

    if not text:
        return jsonify({"message": "Message text is required"}), 400

    if receiver_id and community_id:
        return jsonify({"message": "Message cannot be for both a user and a community"}), 400

    if receiver_id:
        receiver_user = db.session.get(User, receiver_id)
        if not receiver_user:
            return jsonify({"message": "Receiver user not found"}), 404
        new_message = Message(sender_id=current_user_id, receiver_id=receiver_id, text=text)
    elif community_id:
        community = db.session.get(Community, community_id)
        if not community:
            return jsonify({"message": "Community not found"}), 404
        new_message = Message(sender_id=current_user_id, community_id=community_id, text=text)
    else:
        return jsonify({"message": "Either receiver_id or community_id is required"}), 400

    db.session.add(new_message)
    db.session.commit()
    return jsonify(new_message.to_dict()), 201

@app.route("/api/messages/direct/<int:other_user_id>", methods=["GET"])
@jwt_required()
def get_direct_messages(other_user_id):
    current_user_id = int(get_jwt_identity())
    other_user = db.session.get(User, other_user_id)
    if not other_user:
        return jsonify({"message": "User not found"}), 404

    messages = Message.query.filter(
        or_(
            (Message.sender_id == current_user_id and Message.receiver_id == other_user_id),
            (Message.sender_id == other_user_id and Message.receiver_id == current_user_id)
        )
    ).filter(Message.community_id == None).order_by(Message.timestamp.asc()).all()

    for msg in messages:
        if msg.receiver_id == current_user_id and not msg.is_read:
            msg.is_read = True
            db.session.add(msg)
    db.session.commit()

    return jsonify([msg.to_dict() for msg in messages]), 200

@app.route("/api/messages/community/<int:community_id>", methods=["GET"])
@jwt_required()
def get_community_messages(community_id):
    community = db.session.get(Community, community_id)
    if not community:
        return jsonify({"message": "Community not found"}), 404

    messages = Message.query.filter_by(community_id=community_id).order_by(Message.timestamp.asc()).all()
    return jsonify([msg.to_dict() for msg in messages]), 200

# --- File Serving Routes ---
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# --- Frontend Serving Routes ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# --- Generic 500 Error Handler (Added) ---
@app.errorhandler(500)
def internal_server_error(e):
    # Log the full traceback for debugging
    app.logger.exception("An internal server error occurred.")
    return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# --- App Run ---
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
