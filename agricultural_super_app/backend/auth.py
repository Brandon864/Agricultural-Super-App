from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db, bcrypt
from models import User
from schemas import user_schema

def register_auth_routes(app):
    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({"message": "Missing username, email, or password"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"message": "Username already exists"}), 409
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already registered"}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, email=email, password_hash=hashed_password)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            return jsonify({"message": "User registered successfully", "user": user_schema.dump(new_user)}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error registering user", "error": str(e)}), 500

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password_hash, password):
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token, user=user_schema.dump(user)), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401

    @app.route('/api/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        return jsonify(user_schema.dump(user)), 200

    @app.route('/api/profile', methods=['PUT'])
    @jwt_required()
    def update_profile():
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        data = request.get_json()
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.bio = data.get('bio', user.bio)
        # Handle profile picture update separately or here with file upload logic
        # For simplicity, we'll just update text fields

        try:
            db.session.commit()
            return jsonify({"message": "Profile updated successfully", "user": user_schema.dump(user)}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error updating profile", "error": str(e)}), 500
