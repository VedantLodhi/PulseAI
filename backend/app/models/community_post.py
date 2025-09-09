from pydantic import BaseModel, Field
from typing import List
from bson import ObjectId

class CommunityPost(BaseModel):
    userId: str
    content: str
    likeCount: int
    likedUsers: List[str]
