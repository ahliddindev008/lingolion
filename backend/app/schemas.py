from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class DeviceSessionOut(BaseModel):
    id: int
    device_id: str
    device_name: str
    created_at: datetime
    last_used_at: datetime
    is_current: bool


class EmailPasswordLogin(BaseModel):
    email: str = Field(min_length=3, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_login_name(cls, value: str) -> str:
        return value.strip().casefold()

    @field_validator("password")
    @classmethod
    def password_must_fit_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes")
        return value


class EmailPasswordSignup(EmailPasswordLogin):
    pass


class UserOut(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    age: Optional[int] = None
    region: Optional[str] = None
    interface_language: str
    xp: int
    coins: int
    streak_days: int
    reputation_score: int
    onboarding_completed: bool

    model_config = ConfigDict(from_attributes=True)


# ---------- Onboarding ----------
class OnboardingRequest(BaseModel):
    first_name: str
    last_name: str
    age: int = Field(ge=3, le=120)
    region: str
    source_language: str
    target_language: str
    current_level: str = Field(pattern="^(A1|A2|B1|B2|C1|C2)$")
    learning_goal: str
    daily_time_minutes: int = Field(ge=5, le=480)
    interface_language: str = Field(pattern="^(tj|ru|en|de|fr|es|it|tr|ar|fa|zh-CN|ja)$")


# ---------- Language pairs ----------
class LanguagePairOut(BaseModel):
    id: int
    source_language: str
    target_language: str
    current_level: str
    learning_goal: Optional[str]
    daily_time_minutes: int
    xp: int
    streak_days: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class LanguagePairCreate(BaseModel):
    source_language: str
    target_language: str
    current_level: str = Field(pattern="^(A1|A2|B1|B2|C1|C2)$")
    learning_goal: str
    daily_time_minutes: int = Field(default=15, ge=5, le=480)


class LanguagePairUpdate(BaseModel):
    current_level: Optional[str] = Field(default=None, pattern="^(A1|A2|B1|B2|C1|C2)$")
    learning_goal: Optional[str] = Field(default=None, max_length=255)
    daily_time_minutes: Optional[int] = Field(default=None, ge=5, le=480)


# ---------- Lessons ----------
class LessonGenerateRequest(BaseModel):
    language_pair_id: int
    topic: Optional[str] = None
    unit_number: Optional[int] = Field(default=None, ge=1, le=50)
    lesson_type: Optional[str] = Field(default=None, pattern="^(grammar|practice|speaking|writing|listening)$")


class CustomLessonGenerateRequest(BaseModel):
    language_pair_id: int
    topic: str = Field(min_length=1, max_length=255)


class SpeakingPracticeGenerateRequest(BaseModel):
    language_pair_id: int
    unit_number: int = Field(ge=1, le=50)


class PlacementResult(BaseModel):
    level: str = Field(pattern="^(A1|A2|B1|B2|C1|C2)$")
    score: int = Field(ge=0, le=100)


class LessonOut(BaseModel):
    id: int
    title: str
    level: str
    topic: Optional[str]
    content: Any
    is_completed: bool
    score: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LessonCompleteRequest(BaseModel):
    lesson_id: int
    score: int = Field(ge=0, le=100)


# ---------- Chat ----------
class ChatReplyPreview(BaseModel):
    id: int
    sender_name: Optional[str] = None
    is_ai: bool = False
    snippet: str = ""

    model_config = ConfigDict(from_attributes=True)


class ChatMessageOut(BaseModel):
    id: int
    room: str
    sender_id: Optional[int]
    is_ai: bool
    content: str
    corrected_text: Optional[str]
    correction_notes: Optional[str]
    reply_to_id: Optional[int] = None
    reply_to: Optional[ChatReplyPreview] = None
    sender_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSendRequest(BaseModel):
    room: str
    content: str = Field(min_length=1, max_length=2000)
    language_pair_id: Optional[int] = None
    practice_scenario: str = Field(
        default="free_talk",
        pattern="^(free_talk|introductions|cafe|travel|work)$",
    )
    reply_to_id: Optional[int] = None


# ---------- Chat spaces (groups & channels) ----------
class ChatSpaceCreate(BaseModel):
    kind: str = Field(pattern="^(group|channel)$")
    name: str = Field(min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    member_ids: list[int] = []


class ChatSpaceJoinRequest(BaseModel):
    code: str = Field(min_length=4, max_length=16)


class ChatSpaceAddMembers(BaseModel):
    user_ids: list[int] = Field(min_length=1, max_length=100)


class ChatSpaceMemberOut(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSpaceOut(BaseModel):
    id: int
    kind: str
    name: str
    description: Optional[str] = None
    room: str
    invite_code: str
    creator_id: int
    my_role: str
    can_post: bool
    member_count: int
    members: list[ChatSpaceMemberOut]
    last_message: Optional[ChatMessageOut] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Games ----------
class GameScoreSubmit(BaseModel):
    game_type: str = Field(pattern="^(vocabulary_learning|vocab_match|translation|speed_challenge|multiple_choice|word_scramble|listening|speaking|writing|reading)$")
    score: int = Field(ge=0, le=100000)
    language_pair_id: Optional[int] = None
    topic_id: Optional[str] = Field(default=None, pattern="^(greetings|cafe|travel)$")


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    source_language: str = Field(pattern="^(auto|[a-zA-Z]{2,3}(?:-[A-Za-z0-9]{2,8})*)$")
    target_language: str = Field(pattern="^[a-zA-Z]{2,3}(?:-[A-Za-z0-9]{2,8})*$")


class TranslationResponse(BaseModel):
    translated_text: str


class SpeechRecognitionResponse(BaseModel):
    text: str


# ---------- Rating ----------
class LeaderboardEntry(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    xp: int
    reputation_score: int
    streak_days: int


# ---------- Profile ----------
class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    region: Optional[str] = None
    interface_language: Optional[str] = Field(default=None, pattern="^(tj|ru|en|de|fr|es|it|tr|ar|fa|zh-CN|ja)$")


class DeleteAccountRequest(BaseModel):
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_must_fit_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes")
        return value


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    kind: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Daily challenges ----------
class DailyChallengeOut(BaseModel):
    code: str
    title: str
    target: int
    progress: int
    xp_reward: int
    completed: bool

    model_config = ConfigDict(from_attributes=True)


# ---------- Language partners ----------
class PartnerOut(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    source_language: str
    target_language: str
    current_level: str
    room: str
