from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user # Import current_user
from extensions import db
from models import User, Post, Community, Follow, Comment, Like, Message
from schemas import (
    UserSchema, users_schema, # Use UserSchema directly for context
    PostSchema, posts_schema, # Use PostSchema directly for context
    CommunitySchema, communities_schema, # Use CommunitySchema directly for context
    comment_schema, comments_schema,
    like_schema, likes_schema,
    message_schema, messages_schema,
    follow_schema, follows_schema
)
from auth import register_auth_routes
import os
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def register_routes(app):
    register_auth_routes(app)

    # --- User Routes ---
    @app.route('/api/users', methods=['GET'])
    @jwt_required(optional=True) # Allow access even if not logged in
    def get_users():
        users = User.query.all()
        # Pass current_user to the schema context
        users_schema_with_context = UserSchema(many=True, context={'current_user': current_user})
        return jsonify(users_schema_with_context.dump(users)), 200

    @app.route('/api/users/<int:user_id>', methods=['GET'])
    @jwt_required(optional=True) # Allow access even if not logged in
    def get_user(user_id):
        user = User.query.get_or_404(user_id)
        # Pass current_user to the schema context
        user_schema_with_context = UserSchema(context={'current_user': current_user})
        return jsonify(user_schema_with_context.dump(user)), 200

    # --- Post Routes ---
    @app.route('/api/posts', methods=['GET'])
    @jwt_required(optional=True) # Allow access even if not logged in
    def get_posts():
        posts = Post.query.order_by(Post.created_at.desc()).all()
        # Pass current_user to the schema context (for author's is_following)
        posts_schema_with_context = PostSchema(many=True, context={'current_user': current_user})
        return jsonify(posts_schema_with_context.dump(posts)), 200

    @app.route('/api/posts', methods=['POST'])
    @jwt_required()
    def create_post():
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        title = request.form.get('title')
        content = request.form.get('content')
        image_file = request.files.get('image')

        if not title or not content:
            return jsonify({"message": "Title and content are required"}), 400

        image_url = None
        if image_file and allowed_file(image_file.filename):
            filename = secure_filename(image_file.filename)
            upload_folder = app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            filepath = os.path.join(upload_folder, filename)
            image_file.save(filepath)
            image_url = f"/static/uploads/{filename}"

        new_post = Post(title=title, content=content, user_id=current_user_id, image_url=image_url)
        
        try:
            db.session.add(new_post)
            db.session.commit()
            # Pass current_user to the schema context for the response
            post_schema_with_context = PostSchema(context={'current_user': current_user})
            return jsonify({"message": "Post created successfully", "post": post_schema_with_context.dump(new_post)}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error creating post", "error": str(e)}), 500

    @app.route('/api/posts/<int:post_id>', methods=['GET'])
    @jwt_required(optional=True)
    def get_post(post_id):
        post = Post.query.get_or_404(post_id)
        # Pass current_user to the schema context
        post_schema_with_context = PostSchema(context={'current_user': current_user})
        return jsonify(post_schema_with_context.dump(post)), 200

    @app.route('/api/posts/<int:post_id>', methods=['PUT'])
    @jwt_required()
    def update_post(post_id):
        current_user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)

        if post.user_id != current_user_id:
            return jsonify({"message": "You are not authorized to update this post"}), 403

        data = request.get_json()
        post.title = data.get('title', post.title)
        post.content = data.get('content', post.content)

        try:
            db.session.commit()
            # Pass current_user to the schema context
            post_schema_with_context = PostSchema(context={'current_user': current_user})
            return jsonify({"message": "Post updated successfully", "post": post_schema_with_context.dump(post)}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error updating post", "error": str(e)}), 500

    @app.route('/api/posts/<int:post_id>', methods=['DELETE'])
    @jwt_required()
    def delete_post(post_id):
        current_user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)

        if post.user_id != current_user_id:
            return jsonify({"message": "You are not authorized to delete this post"}), 403
        
        try:
            if post.image_url:
                image_path = os.path.join(app.root_path, post.image_url.lstrip('/'))
                if os.path.exists(image_path):
                    os.remove(image_path)
            
            db.session.delete(post)
            db.session.commit()
            return jsonify({"message": "Post deleted successfully"}), 204
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error deleting post", "error": str(e)}), 500

    # --- Community Routes ---
    @app.route('/api/communities', methods=['GET'])
    @jwt_required(optional=True) # Allow access even if not logged in
    def get_communities():
        communities = Community.query.all()
        # Pass current_user to the schema context
        communities_schema_with_context = CommunitySchema(many=True, context={'current_user': current_user})
        return jsonify(communities_schema_with_context.dump(communities)), 200

    @app.route('/api/communities', methods=['POST'])
    @jwt_required()
    def create_community():
        current_user_id = get_jwt_identity()
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')

        if not name:
            return jsonify({"message": "Community name is required"}), 400

        if Community.query.filter_by(name=name).first():
            return jsonify({"message": "Community with this name already exists"}), 409

        new_community = Community(name=name, description=description, admin_id=current_user_id)
        try:
            db.session.add(new_community)
            db.session.commit()
            # Pass current_user to the schema context
            community_schema_with_context = CommunitySchema(context={'current_user': current_user})
            return jsonify({"message": "Community created successfully", "community": community_schema_with_context.dump(new_community)}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error creating community", "error": str(e)}), 500

    # --- NEW: User Follow Routes ---
    @app.route('/api/users/<int:user_id>/follow', methods=['POST'])
    @jwt_required()
    def follow_user(user_id):
        current_user_id = get_jwt_identity()
        if current_user_id == user_id:
            return jsonify({"message": "You cannot follow yourself"}), 400

        user_to_follow = User.query.get(user_id)
        if not user_to_follow:
            return jsonify({"message": "User not found"}), 404

        existing_follow = Follow.query.filter_by(
            follower_id=current_user_id,
            followed_id=user_id,
            followed_type='user'
        ).first()

        if existing_follow:
            return jsonify({"message": "Already following this user"}), 409

        new_follow = Follow(follower_id=current_user_id, followed_id=user_id, followed_type='user')
        try:
            db.session.add(new_follow)
            db.session.commit()
            return jsonify({"message": "User followed successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error following user", "error": str(e)}), 500

    @app.route('/api/users/<int:user_id>/follow', methods=['DELETE'])
    @jwt_required()
    def unfollow_user(user_id):
        current_user_id = get_jwt_identity()
        
        follow = Follow.query.filter_by(
            follower_id=current_user_id,
            followed_id=user_id,
            followed_type='user'
        ).first()

        if not follow:
            return jsonify({"message": "You are not following this user"}), 404
        
        try:
            db.session.delete(follow)
            db.session.commit()
            return jsonify({"message": "User unfollowed successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error unfollowing user", "error": str(e)}), 500

    # --- NEW: Community Follow Routes ---
    @app.route('/api/communities/<int:community_id>/follow', methods=['POST'])
    @jwt_required()
    def follow_community(community_id):
        current_user_id = get_jwt_identity()
        
        community_to_follow = Community.query.get(community_id)
        if not community_to_follow:
            return jsonify({"message": "Community not found"}), 404

        existing_follow = Follow.query.filter_by(
            follower_id=current_user_id,
            followed_id=community_id,
            followed_type='community'
        ).first()

        if existing_follow:
            return jsonify({"message": "Already following this community"}), 409

        new_follow = Follow(follower_id=current_user_id, followed_id=community_id, followed_type='community')
        try:
            db.session.add(new_follow)
            db.session.commit()
            return jsonify({"message": "Community followed successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error following community", "error": str(e)}), 500

    @app.route('/api/communities/<int:community_id>/follow', methods=['DELETE'])
    @jwt_required()
    def unfollow_community(community_id):
        current_user_id = get_jwt_identity()
        
        follow = Follow.query.filter_by(
            follower_id=current_user_id,
            followed_id=community_id,
            followed_type='community'
        ).first()

        if not follow:
            return jsonify({"message": "You are not following this community"}), 404
        
        try:
            db.session.delete(follow)
            db.session.commit()
            return jsonify({"message": "Community unfollowed successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error unfollowing community", "error": str(e)}), 500


    # --- Remaining Routes (no changes needed for now) ---
    @app.route('/api/users/<int:user_id>/following', methods=['GET'])
    def get_user_following(user_id):
        user = User.query.get_or_404(user_id)
        # This route might need more sophisticated loading if you want actual User/Community objects
        # For now, it returns raw Follow objects as per your original schema setup
        following = Follow.query.filter_by(follower_id=user.id).all()
        return jsonify(follows_schema.dump(following)), 200

    @app.route('/api/posts/<int:post_id>/comments', methods=['GET'])
    def get_post_comments(post_id):
        post = Post.query.get_or_404(post_id)
        comments = Comment.query.filter_by(post_id=post.id).order_by(Comment.created_at.asc()).all()
        return jsonify(comments_schema.dump(comments)), 200

    @app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
    @jwt_required()
    def add_comment(post_id):
        current_user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        data = request.get_json()
        content = data.get('content')

        if not content:
            return jsonify({"message": "Comment content cannot be empty"}), 400

        new_comment = Comment(content=content, user_id=current_user_id, post_id=post.id)
        try:
            db.session.add(new_comment)
            db.session.commit()
            return jsonify({"message": "Comment added successfully", "comment": comment_schema.dump(new_comment)}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding comment", "error": str(e)}), 500

    @app.route('/api/posts/<int:post_id>/like', methods=['POST'])
    @jwt_required()
    def like_post(post_id):
        current_user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)

        existing_like = Like.query.filter_by(user_id=current_user_id, post_id=post.id).first()
        if existing_like:
            return jsonify({"message": "You have already liked this post"}), 409

        new_like = Like(user_id=current_user_id, post_id=post.id)
        try:
            db.session.add(new_like)
            db.session.commit()
            return jsonify({"message": "Post liked successfully", "like": like_schema.dump(new_like)}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error liking post", "error": str(e)}), 500

    @app.route('/api/posts/<int:post_id>/unlike', methods=['POST'])
    @jwt_required()
    def unlike_post(post_id):
        current_user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)

        like = Like.query.filter_by(user_id=current_user_id, post_id=post.id).first()
        if not like:
            return jsonify({"message": "You have not liked this post"}), 404

        try:
            db.session.delete(like)
            db.session.commit()
            return jsonify({"message": "Post unliked successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error unliking post", "error": str(e)}), 500
    
    @app.route('/api/messages', methods=['POST'])
    @jwt_required()
    def send_message():
        current_user_id = get_jwt_identity()
        data = request.get_json()
        receiver_id = data.get('receiver_id')
        content = data.get('content')

        if not receiver_id or not content:
            return jsonify({"message": "Receiver ID and content are required"}), 400

        receiver = User.query.get(receiver_id)
        if not receiver:
            return jsonify({"message": "Receiver not found"}), 404
        
        new_message = Message(sender_id=current_user_id, receiver_id=receiver_id, content=content)
        try:
            db.session.add(new_message)
            db.session.commit()
            return jsonify({"message": "Message sent successfully", "message": message_schema.dump(new_message)}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error sending message", "error": str(e)}), 500

    @app.route('/api/messages/sent', methods=['GET'])
    @jwt_required()
    def get_sent_messages():
        current_user_id = get_jwt_identity()
        messages = Message.query.filter_by(sender_id=current_user_id).order_by(Message.created_at.desc()).all()
        return jsonify(messages_schema.dump(messages)), 200

    @app.route('/api/messages/received', methods=['GET'])
    @jwt_required()
    def get_received_messages():
        current_user_id = get_jwt_identity()
        messages = Message.query.filter_by(receiver_id=current_user_id).order_by(Message.created_at.desc()).all()
        return jsonify(messages_schema.dump(messages)), 200

    @app.route('/api/messages/<int:message_id>/read', methods=['PUT'])
    @jwt_required()
    def mark_message_read(message_id):
        current_user_id = get_jwt_identity()
        message = Message.query.get_or_404(message_id)

        if message.receiver_id != current_user_id:
            return jsonify({"message": "You are not authorized to mark this message as read"}), 403

        message.is_read = True
        try:
            db.session.commit()
            return jsonify({"message": "Message marked as read", "message": message_schema.dump(message)}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error marking message as read", "error": str(e)}), 500