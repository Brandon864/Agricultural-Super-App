from extensions import ma
from models import User, Post, Community, Comment, Like, Message, Follow # Import all models
from flask_jwt_extended import current_user # Import current_user for schema context

# Define a base schema for common fields for followed entities
class BaseFollowedSchema(ma.SQLAlchemyAutoSchema):
    # This will be overridden by UserSchema and CommunitySchema Meta classes
    pass

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_relationships = True
        exclude = ('password_hash',) # Exclude sensitive fields

    # Add calculated fields for follower/following counts
    followers_count = ma.Method("get_followers_count")
    following_users_count = ma.Method("get_following_users_count")
    following_communities_count = ma.Method("get_following_communities_count")

    # Add a field to indicate if the current user is following this user
    # This field relies on `current_user` being passed in the schema's context
    is_following = ma.Method("get_is_following")

    def get_followers_count(self, obj):
        # Count only users who follow this user (followed_type = 'user')
        return obj.followed_by_users_associations.count()

    def get_following_users_count(self, obj):
        # Count users this user is following (followed_type = 'user')
        return obj.following_users_associations.count()

    def get_following_communities_count(self, obj):
        # Count communities this user is following (followed_type = 'community')
        return obj.following_communities_associations.count()

    def get_is_following(self, obj):
        # `self.context` should contain {'current_user': current_user_object}
        current_user_obj = self.context.get('current_user')
        if not current_user_obj or current_user_obj.is_anonymous:
            return False
        # Check if the current user is following the 'obj' (the user being serialized)
        return Follow.query.filter_by(
            follower_id=current_user_obj.id,
            followed_id=obj.id,
            followed_type='user'
        ).first() is not None

class PostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Post
        load_instance = True
        include_relationships = True

    # Pass the current_user context to the nested UserSchema for the author
    author = ma.Nested(UserSchema, only=(
        'id', 'username', 'profile_picture', 'followers_count', 'is_following'
    ), context={'current_user': current_user}) # Pass context here

class CommunitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Community
        load_instance = True
        include_relationships = True

    admin = ma.Nested(UserSchema, only=('id', 'username')) # Assuming admin is a User

    # Add calculated field for follower count
    followers_count = ma.Method("get_followers_count")
    # Add a field to indicate if the current user is following this community
    is_followed = ma.Method("get_is_followed")

    def get_followers_count(self, obj):
        # Count users who follow this community (followed_type = 'community')
        return obj.followers_communities_associations.count()

    def get_is_followed(self, obj):
        # `self.context` should contain {'current_user': current_user_object}
        current_user_obj = self.context.get('current_user')
        if not current_user_obj or current_user_obj.is_anonymous:
            return False
        # Check if the current user is following the 'obj' (the community being serialized)
        return Follow.query.filter_by(
            follower_id=current_user_obj.id,
            followed_id=obj.id,
            followed_type='community'
        ).first() is not None

class CommentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Comment
        load_instance = True
        include_relationships = True

    comment_author = ma.Nested(UserSchema, only=('id', 'username', 'profile_picture'))

class LikeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Like
        load_instance = True
        include_relationships = True

    liker = ma.Nested(UserSchema, only=('id', 'username', 'profile_picture'))

class MessageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Message
        load_instance = True
        include_relationships = True

    sender = ma.Nested(UserSchema, only=('id', 'username', 'profile_picture'))
    receiver = ma.Nested(UserSchema, only=('id', 'username', 'profile_picture'))

class FollowSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Follow
        load_instance = True
        include_relationships = True
    
    follower = ma.Nested(UserSchema, only=('id', 'username', 'profile_picture'))
    # You'll need custom fields or logic here to show the 'followed' entity (user or community)
    # For simplicity, we'll keep it basic for now, or you can add conditional loading based on followed_type.


# Instantiate schemas for single and multiple objects
# IMPORTANT: When using schemas that rely on current_user context, you MUST
# pass the context when instantiating them within your routes.
# The `user_schema` and `users_schema` below are global, and won't have context by default.
# For API routes where you need `is_following`, you'll instantiate like:
# user_schema = UserSchema(context={"current_user": current_user})
# users_schema = UserSchema(many=True, context={"current_user": current_user})
user_schema = UserSchema()
users_schema = UserSchema(many=True)

post_schema = PostSchema() # Will need context for author's `is_following`
posts_schema = PostSchema(many=True) # Will need context for author's `is_following`

community_schema = CommunitySchema() # Will need context for `is_followed`
communities_schema = CommunitySchema(many=True) # Will need context for `is_followed`

comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)

like_schema = LikeSchema()
likes_schema = LikeSchema(many=True)

message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)

follow_schema = FollowSchema()
follows_schema = FollowSchema(many=True)