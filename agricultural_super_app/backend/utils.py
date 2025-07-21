# Place for utility functions like image processing, data validation helpers, etc.

# Example: Allowed file extensions (also in config.py)
def allowed_file_extension(filename, allowed_extensions):
    return '.' in filename and            filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Example: Custom error handlers (can also be in app.py or a blueprint)
def handle_invalid_input(e):
    return jsonify({"message": "Invalid input provided", "details": str(e)}), 400

# Other helper functions...
