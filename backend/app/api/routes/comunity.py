from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from bson import ObjectId
from ...models.community_post import CommunityPost

router = APIRouter()

class PostCreate(BaseModel):
    userId: str
    content: str

class LikePost(BaseModel):
    userId: str
    postId: str

client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
print(client)
db = client["auth_db"]
users_collection = db["users"]
community_collection = db["community_posts"]

@router.post("/addpost", status_code=status.HTTP_201_CREATED)
async def add_post(post: PostCreate):
    existing_user = await users_collection.find_one({"_id": post.userId})
    if not existing_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    post_data = CommunityPost(
        userId=post.userId,
        content=post.content,
        likeCount=0,
        likedUsers=[]
    )
    result = await community_collection.insert_one(post_data.dict())
    if not result.inserted_id:
        raise HTTPException(detail="Post could not be created")
    
    return {"post": result, "message": "Post created successfully"}

@router.post("/likepost", status_code=status.HTTP_200_OK)
async def like_post(like: LikePost):
    existing_post = await community_collection.find_one({"_id": ObjectId(like.postId)})
    if not existing_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if like.userId in existing_post["likedUsers"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already liked this post")

    update_result = await community_collection.update_one(
        {"_id": ObjectId(like.postId)},
        {"$inc": {"likeCount": 1}, "$push": {"likedUsers": like.userId}}
    )
    if update_result.modified_count == 0:
        raise HTTPException(detail="Could not like the post")

    return {"message": "Post liked successfully", "post": existing_post}



@router.post("/dislikepost", status_code=status.HTTP_200_OK)
async def dislike_post(like: LikePost):
    existing_post = await community_collection.find_one({"_id": ObjectId(like.postId)})
    if not existing_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if like.userId not in existing_post["likedUsers"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User has not liked this post")

    update_result = await community_collection.update_one(
        {"_id": ObjectId(like.postId)},
        {"$inc": {"likeCount": -1}, "$pull": {"likedUsers": like.userId}}
    )
    if update_result.modified_count == 0:
        raise HTTPException(detail="Could not dislike the post")

    return {"message": "Post disliked successfully", "post": existing_post}
