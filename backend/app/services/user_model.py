from pydantic import BaseModel,Field
import random
class User(BaseModel):
    username: str
    email:str
    password: str
    otp:int=Field(default_factory=lambda: random.randint(100000,999999),example=123456)
