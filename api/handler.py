from mangum import Mangum
from app import app

# AWS Lambda handler
handler = Mangum(app)