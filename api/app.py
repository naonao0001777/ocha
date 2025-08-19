import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from supabase import create_client, Client
from datetime import datetime, timedelta
import json
import hashlib
import secrets
from jose import JWTError, jwt
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

app = FastAPI(
    title="Ocha Profile API",
    description="API for Ocha Profile Service",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",  # Next.js dev server alternative port
        "https://*.vercel.app",
        "https://ocha.onrender.com",
        "*"  # 本番環境では適切なドメインに制限
    ],
    allow_credentials=False,  # Lambdaでは通常False
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# JWT設定
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30

# セキュリティスキーム
security = HTTPBearer()

def get_supabase_client() -> Client:
    """Supabaseクライアントを取得"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase configuration not found"
        )
    
    return create_client(supabase_url, supabase_key)

def hash_password(password: str) -> str:
    """パスワードをハッシュ化"""
    salt = secrets.token_hex(32)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}:{password_hash.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    """パスワードを検証"""
    try:
        salt, hash_hex = hashed_password.split(':')
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return hash_hex == password_hash.hex()
    except:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWTアクセストークンを作成"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """JWTトークンを検証"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Pydanticモデル
class UserResponse(BaseModel):
    id: str
    user_name: str
    name: str
    email: str
    biography: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: str
    updated_at: str

class LinkResponse(BaseModel):
    id: int
    title: str
    url: str
    order_index: int

class SocialAccountResponse(BaseModel):
    id: int
    platform: str
    url: str

class UserProfileResponse(BaseModel):
    user: UserResponse
    links: List[LinkResponse]
    social_accounts: List[SocialAccountResponse]

class CreateUserRequest(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1, max_length=255, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    password: Optional[str] = Field(None, min_length=4)
    biography: Optional[str] = Field(None, max_length=500)

class CreateLinkRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    url: str = Field(..., min_length=1, max_length=500)

class CreateSocialAccountRequest(BaseModel):
    platform: str = Field(..., pattern="^(youtube|x|twitch|github|instagram|facebook)$")
    url: str = Field(..., min_length=1, max_length=500)

class UpdateUserProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    biography: Optional[str] = Field(None, max_length=500)
    # profile_image は null 許可（削除時に None を受け付ける）
    profile_image: Optional[str] = Field(None, max_length=500)

class PresignedUrlResponse(BaseModel):
    upload_url: str
    file_key: str
    token: str

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)

class LoginResponse(BaseModel):
    success: bool
    user_id: str
    user_name: str
    message: str
    access_token: str
    token_type: str = "bearer"

# API エンドポイント
@app.get("/")
async def root():
    return {"message": "Ocha Profile API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/debug/users")
async def debug_users(sb: Client = Depends(get_supabase_client)):
    """デバッグ用: ユーザー一覧を取得"""
    try:
        result = sb.table('users').select('id, user_name, email, is_deleted, created_at').limit(10).execute()
        return {"users": result.data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/users/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(user_id: str, sb: Client = Depends(get_supabase_client)):
    """ユーザープロフィール取得"""
    
    # ユーザー情報取得（論理削除されていないもののみ）
    try:
        user_result = sb.table('users').select('*').eq('user_name', user_id).eq('is_deleted', False).single().execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = user_result.data
    
    # リンク取得
    links_result = sb.table('links').select('*').eq('user_id', user['id']).order('order_index').execute()
    links = links_result.data or []
    
    # SNSアカウント取得
    social_result = sb.table('social_accounts').select('*').eq('user_id', user['id']).execute()
    social_accounts = social_result.data or []
    
    return UserProfileResponse(
        user=UserResponse(**user),
        links=[LinkResponse(**link) for link in links],
        social_accounts=[SocialAccountResponse(**account) for account in social_accounts]
    )

@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user_data: CreateUserRequest, sb: Client = Depends(get_supabase_client)):
    """ユーザー作成"""
    
    # ユーザー名重複チェック（論理削除されていないもののみ）
    existing_username = sb.table('users').select('id').eq('user_name', user_data.user_name).eq('is_deleted', False).execute()
    if existing_username.data:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # メールアドレス重複チェック（論理削除関係なく全てのレコード）
    existing_email = sb.table('users').select('id').eq('email', user_data.email).execute()
    if existing_email.data:
        raise HTTPException(status_code=400, detail="Email address is already in use")
    
    # パスワードをハッシュ化
    password_to_hash = user_data.password or "password"  # パスワードが提供されない場合のデフォルト
    password_hash = hash_password(password_to_hash)
    
    # ユーザー作成
    now = datetime.utcnow().isoformat()
    user_insert = {
        'user_name': user_data.user_name,
        'name': user_data.name,
        'email': user_data.email,
        'password_hash': password_hash,
        'biography': user_data.biography,
        'created_at': now,
        'updated_at': now
    }
    
    try:
        result = sb.table('users').insert(user_insert).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
    except Exception as e:
        # データベースの制約エラーをキャッチ
        error_str = str(e)
        print(f"[ERROR] User creation failed: {error_str}")
        print(f"[ERROR] User data: {user_insert}")
        import traceback
        traceback.print_exc()
        
        if "duplicate key" in error_str or "already exists" in error_str:
            if "email" in error_str:
                raise HTTPException(status_code=400, detail="Email address is already in use")
            else:
                raise HTTPException(status_code=400, detail="Username already exists")
        else:
            raise HTTPException(status_code=500, detail=f"Database error: {error_str}")
    
    # 作成されたユーザーを取得
    created_user = sb.table('users').select('*').eq('user_name', user_data.user_name).single().execute()
    
    if not created_user.data:
        raise HTTPException(status_code=500, detail="Failed to retrieve created user")
    
    return UserResponse(**created_user.data)

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str, profile_data: UpdateUserProfileRequest, current_user: str = Depends(verify_token), sb: Client = Depends(get_supabase_client)):
    """ユーザープロフィール更新"""
    
    # 所有者チェック - 自分のプロフィールのみ更新可能
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # ユーザー存在確認
    user_result = sb.table('users').select('id').eq('user_name', user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 更新データの準備
    update_data = {'updated_at': datetime.utcnow().isoformat()}
    # リクエストで指定されたフィールドだけ更新（Noneも有効、profile_image を null にできる）
    payload = profile_data.model_dump(exclude_unset=True)
    if 'name' in payload:
        update_data['name'] = payload['name']
    if 'biography' in payload:
        update_data['biography'] = payload['biography']
    if 'profile_image' in payload:
        update_data['profile_image'] = payload['profile_image']  # None を許容
    
    # プロフィール更新
    result = sb.table('users').update(update_data).eq('user_name', user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update user profile")
    
    # 更新されたユーザーを取得
    updated_user = sb.table('users').select('*').eq('user_name', user_id).single().execute()
    
    if not updated_user.data:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated user")
    
    return UserResponse(**updated_user.data)

@app.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, sb: Client = Depends(get_supabase_client)):
    """ユーザーログイン（メールアドレスベース）"""
    
    # まずユーザーの存在確認（論理削除チェック含む）
    try:
        user_result = sb.table('users').select('*').eq('email', login_data.email).single().execute()
        if not user_result.data:
            # ユーザーが存在しない
            raise HTTPException(status_code=404, detail="Account does not exist")
        
        user = user_result.data
        
        # 論理削除されているかチェック
        if user.get('is_deleted', False):
            raise HTTPException(status_code=404, detail="Account does not exist")
            
    except HTTPException:
        # HTTPExceptionはそのまま再発生
        raise
    except Exception:
        # その他のエラー（データベース接続エラーなど）はアカウント存在しないエラーとして扱う
        raise HTTPException(status_code=404, detail="Account does not exist")
    
    # パスワードハッシュの存在確認
    if not user.get('password_hash'):
        raise HTTPException(status_code=500, detail="User password not configured")
    
    # パスワード検証
    if not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # JWTトークン生成
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['user_name']}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        success=True,
        user_id=user['user_name'],
        user_name=user['name'],
        message="ログインに成功しました",
        access_token=access_token
    )

@app.post("/users/{user_id}/links", response_model=LinkResponse, status_code=201)
async def create_link(user_id: str, link_data: CreateLinkRequest, current_user: str = Depends(verify_token), sb: Client = Depends(get_supabase_client)):
    """リンク作成"""
    
    # 所有者チェック
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # ユーザー存在確認
    user_result = sb.table('users').select('id').eq('user_name', user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 次のorder_index計算
    max_order = sb.table('links').select('order_index').eq('user_id', user_result.data['id']).order('order_index', desc=True).limit(1).execute()
    next_order = (max_order.data[0]['order_index'] + 1) if max_order.data else 0
    
    # リンク作成
    now = datetime.utcnow().isoformat()
    link_insert = {
        'user_id': user_result.data['id'],
        'title': link_data.title,
        'url': link_data.url,
        'order_index': next_order,
        'created_at': now,
        'updated_at': now
    }
    
    result = sb.table('links').insert(link_insert).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create link")
    
    # 作成されたリンクを取得
    created_link = result.data[0] if result.data else None
    if not created_link:
        raise HTTPException(status_code=500, detail="Failed to retrieve created link")
    
    return LinkResponse(**created_link)

@app.post("/users/{user_id}/social-accounts", response_model=SocialAccountResponse, status_code=201)
async def create_social_account(user_id: str, social_data: CreateSocialAccountRequest, current_user: str = Depends(verify_token), sb: Client = Depends(get_supabase_client)):
    """SNSアカウント作成"""
    
    # 所有者チェック
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # ユーザー存在確認
    user_result = sb.table('users').select('id').eq('user_name', user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 同じプラットフォーム重複チェック
    existing = sb.table('social_accounts').select('id').eq('user_id', user_result.data['id']).eq('platform', social_data.platform).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Social account for this platform already exists")
    
    # SNSアカウント作成
    now = datetime.utcnow().isoformat()
    social_insert = {
        'user_id': user_result.data['id'],
        'platform': social_data.platform,
        'url': social_data.url,
        'created_at': now,
        'updated_at': now
    }
    
    result = sb.table('social_accounts').insert(social_insert).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create social account")
    
    # 作成されたソーシャルアカウントを取得
    created_social = result.data[0] if result.data else None
    if not created_social:
        raise HTTPException(status_code=500, detail="Failed to retrieve created social account")
    
    return SocialAccountResponse(**created_social)

@app.put("/users/{user_id}/social-accounts/{social_id}", response_model=SocialAccountResponse)
async def update_social_account(user_id: str, social_id: int, social_data: CreateSocialAccountRequest, current_user: str = Depends(verify_token), sb: Client = Depends(get_supabase_client)):
    """SNSアカウント更新"""
    
    # 所有者チェック
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # ユーザー存在確認
    user_result = sb.table('users').select('id').eq('user_name', user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # SNSアカウント存在確認と所有者チェック
    social_result = sb.table('social_accounts').select('*').eq('id', social_id).eq('user_id', user_result.data['id']).single().execute()
    if not social_result.data:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    # 同じプラットフォームの重複チェック（自分以外）
    existing = sb.table('social_accounts').select('id').eq('user_id', user_result.data['id']).eq('platform', social_data.platform).neq('id', social_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Social account for this platform already exists")
    
    # SNSアカウント更新
    now = datetime.utcnow().isoformat()
    update_data = {
        'platform': social_data.platform,
        'url': social_data.url,
        'updated_at': now
    }
    
    result = sb.table('social_accounts').update(update_data).eq('id', social_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update social account")
    
    return SocialAccountResponse(**result.data[0])

@app.delete("/users/{user_id}/social-accounts/{social_id}", status_code=204)
async def delete_social_account(user_id: str, social_id: int, current_user: str = Depends(verify_token), sb: Client = Depends(get_supabase_client)):
    """SNSアカウント削除"""
    
    # 所有者チェック
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # ユーザー存在確認
    user_result = sb.table('users').select('id').eq('user_name', user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # SNSアカウント存在確認と所有者チェック
    social_result = sb.table('social_accounts').select('id').eq('id', social_id).eq('user_id', user_result.data['id']).single().execute()
    if not social_result.data:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    # SNSアカウント削除
    result = sb.table('social_accounts').delete().eq('id', social_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to delete social account")

@app.put("/users/{user_id}/links/{link_id}", response_model=LinkResponse)
async def update_link(user_id: str, link_id: int, link_data: CreateLinkRequest, current_user: str = Depends(verify_token), sb: Client = Depends(get_supabase_client)):
    """リンク更新"""
    
    # 所有者チェック
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # ユーザー存在確認
    user_result = sb.table('users').select('id').eq('user_name', user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # リンク存在確認と所有者チェック
    link_result = sb.table('links').select('*').eq('id', link_id).eq('user_id', user_result.data['id']).single().execute()
    if not link_result.data:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # リンク更新
    now = datetime.utcnow().isoformat()
    update_data = {
        'title': link_data.title,
        'url': link_data.url,
        'updated_at': now
    }
    
    result = sb.table('links').update(update_data).eq('id', link_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update link")
    
    return LinkResponse(**result.data[0])

@app.delete("/users/{user_id}/links/{link_id}", status_code=204)
async def delete_link(user_id: str, link_id: int, current_user: str = Depends(verify_token), sb: Client = Depends(get_supabase_client)):
    """リンク削除"""
    
    # 所有者チェック
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # ユーザー存在確認
    user_result = sb.table('users').select('id').eq('user_name', user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # リンク存在確認と所有者チェック
    link_result = sb.table('links').select('id').eq('id', link_id).eq('user_id', user_result.data['id']).single().execute()
    if not link_result.data:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # リンク削除
    result = sb.table('links').delete().eq('id', link_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to delete link")

@app.post("/files/presign", response_model=PresignedUrlResponse)
async def create_presigned_url(sb: Client = Depends(get_supabase_client)):
    """ファイルアップロード用の署名URL生成"""
    
    # 環境変数の名称ゆれ対策（Terraformでは FILES_BUCKET を設定）
    bucket_name = (
        os.environ.get('SUPABASE_STORAGE_BUCKET')
        or os.environ.get('FILES_BUCKET')
        or 'profile-images'
    )
    
    # ユニークなファイルキー生成
    timestamp = int(datetime.utcnow().timestamp())
    file_key = f"uploads/{timestamp}"
    
    try:
        # Supabase Storageの署名URL生成（正しいAPI）
        url_response = sb.storage.from_(bucket_name).create_signed_upload_url(file_key)
        
        # レスポンス形式を確認してキーを取得
        raw_signed_url = (
            (url_response.get('signed_url') if isinstance(url_response, dict) else None)
            or (url_response.get('signedUrl') if isinstance(url_response, dict) else None)
            or (url_response.get('url') if isinstance(url_response, dict) else None)
        )
        token = (url_response.get('token') if isinstance(url_response, dict) else None) or ""

        if not raw_signed_url or not token:
            raise ValueError(f"Invalid response format: {url_response}")

        # 相対URLの場合は SUPABASE_URL を前置
        supabase_url = os.environ.get('SUPABASE_URL', '').rstrip('/')
        signed_url = raw_signed_url
        if supabase_url and isinstance(raw_signed_url, str) and raw_signed_url.startswith('/'):
            signed_url = f"{supabase_url}{raw_signed_url}"
        
        return PresignedUrlResponse(
            upload_url=signed_url,
            file_key=file_key,
            token=token
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create presigned URL: {str(e)}")

@app.delete("/users/{user_id}", status_code=204)
async def delete_user_account(user_id: str, current_user: str = Depends(verify_token), sb: Client = Depends(get_supabase_client)):
    """アカウント削除（論理削除）"""
    
    # 所有者チェック - 自分のアカウントのみ削除可能
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # ユーザー存在確認
    user_result = sb.table('users').select('id, is_deleted').eq('user_name', user_id).single().execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 既に削除済みかチェック
    if user_result.data.get('is_deleted', False):
        raise HTTPException(status_code=400, detail="Account is already deleted")
    
    # 論理削除実行
    update_data = {
        'is_deleted': True,
        'updated_at': datetime.utcnow().isoformat()
    }
    
    result = sb.table('users').update(update_data).eq('user_name', user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to delete account")

@app.post("/auth/check-email")
async def check_email_availability(request: dict, sb: Client = Depends(get_supabase_client)):
    """メールアドレスの利用可能性をチェック"""
    email = request.get('email', '')
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    # メールアドレス重複チェック（論理削除関係なく全てのレコード）
    try:
        existing_email = sb.table('users').select('id').eq('email', email).execute()
        if existing_email.data:
            raise HTTPException(status_code=400, detail="Email address is already in use")
        
        return {"available": True, "message": "Email address is available"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/auth/test-hash")
async def test_hash(request: dict):
    """テスト用パスワードハッシュ生成"""
    password = request.get('password', '')
    if not password:
        raise HTTPException(status_code=400, detail="Password required")
    
    hashed = hash_password(password)
    return {"password": password, "hash": hashed}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)