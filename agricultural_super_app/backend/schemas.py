from extensions import ma
from models import User, Post, Community, Comment, Like, Message, Follow # Import all models

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_relationships = True
        # Exclude sensitive fields like password_hash when serializing
        exclude = ('password_hash',)

class PostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Post
        load_instance = True
        include_relationships = True

    author = ma.Nested(UserSchema, only=('id', 'username', 'profile_picture'))
    # You might want to include nested comments/likes later, but keep it simple for now

class CommunitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Community
        load_instance = True
        include_relationships = True

    admin = ma.Nested(UserSchema, only=('id', 'username')) # Assuming admin is a User

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
user_schema = UserSchema()
users_schema = UserSchema(many=True)

post_schema = PostSchema()
posts_schema = PostSchema(many=True)

community_schema = CommunitySchema()
communities_schema = CommunitySchema(many=True)

comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)

like_schema = LikeSchema()
likes_schema = LikeSchema(many=True)

message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)

follow_schema = FollowSchema()
follows_schema = FollowSchema(many=True)
