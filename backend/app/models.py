from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base
from app.time_utils import utcnow_naive


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    region = Column(String(100), nullable=True)
    interface_language = Column(String(10), default="tj", nullable=False)

    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)
    reputation_score = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow_naive)

    language_pairs = relationship("LanguagePair", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    game_scores = relationship("GameScore", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class LanguagePair(Base):
    __tablename__ = "language_pairs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    source_language = Column(String(50), nullable=False)
    target_language = Column(String(50), nullable=False)
    current_level = Column(String(5), default="A1")  # A1-C2
    learning_goal = Column(String(255), nullable=True)
    daily_time_minutes = Column(Integer, default=15)

    xp = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow_naive)

    user = relationship("User", back_populates="language_pairs")
    lessons = relationship("Lesson", back_populates="language_pair", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("user_id", "source_language", "target_language", name="uq_user_lang_pair"),
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    language_pair_id = Column(Integer, ForeignKey("language_pairs.id"), nullable=False)

    title = Column(String(255), nullable=False)
    level = Column(String(5), nullable=False)
    topic = Column(String(255), nullable=True)
    content = Column(JSON, nullable=False)  # structured: vocabulary, grammar, examples, exercises

    is_completed = Column(Boolean, default=False)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utcnow_naive)
    completed_at = Column(DateTime, nullable=True)

    language_pair = relationship("LanguagePair", back_populates="lessons")


class SharedCourseLessonContent(Base):
    __tablename__ = "shared_course_lesson_content"

    id = Column(Integer, primary_key=True, index=True)
    source_language = Column(String(50), nullable=False)
    target_language = Column(String(50), nullable=False)
    level = Column(String(5), nullable=False)
    unit_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=True)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utcnow_naive, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "source_language",
            "target_language",
            "level",
            "unit_number",
            name="uq_shared_course_lesson",
        ),
    )


class SharedSpeakingPracticeContent(Base):
    __tablename__ = "shared_speaking_practice_content"

    id = Column(Integer, primary_key=True, index=True)
    source_language = Column(String(50), nullable=False)
    target_language = Column(String(50), nullable=False)
    level = Column(String(5), nullable=False)
    unit_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=True)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utcnow_naive, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "source_language",
            "target_language",
            "level",
            "unit_number",
            name="uq_shared_speaking_practice_lesson",
        ),
    )


class SharedCustomLessonContent(Base):
    __tablename__ = "shared_custom_lesson_content"

    id = Column(Integer, primary_key=True, index=True)
    source_language = Column(String(50), nullable=False)
    target_language = Column(String(50), nullable=False)
    level = Column(String(5), nullable=False)
    topic_key = Column(String(255), nullable=False)  # normalized topic, for cross-learner reuse
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=True)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utcnow_naive, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "source_language",
            "target_language",
            "level",
            "topic_key",
            name="uq_shared_custom_lesson",
        ),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    room = Column(String(100), index=True, nullable=False)  # e.g. "ai_tutor_{user_id}" or "partner_{a}_{b}"
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_ai = Column(Boolean, default=False)
    content = Column(Text, nullable=False)
    corrected_text = Column(Text, nullable=True)
    correction_notes = Column(Text, nullable=True)
    reply_to_id = Column(Integer, ForeignKey("chat_messages.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=utcnow_naive)
    reply_to = relationship("ChatMessage", remote_side=[id], uselist=False)


class ChatRoomState(Base):
    __tablename__ = "chat_room_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    room = Column(String(100), nullable=False)
    cleared_at = Column(DateTime, nullable=False, default=utcnow_naive)

    __table_args__ = (UniqueConstraint("user_id", "room", name="uq_user_chat_room_state"),)


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    unlocked_at = Column(DateTime, default=utcnow_naive)

    user = relationship("User", back_populates="achievements")

    __table_args__ = (UniqueConstraint("user_id", "code", name="uq_user_achievement"),)


class GameScore(Base):
    __tablename__ = "game_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_type = Column(String(50), nullable=False)  # vocabulary, translation, quiz, or word scramble
    topic_id = Column(String(50), nullable=True)
    language_pair_id = Column(Integer, ForeignKey("language_pairs.id", ondelete="SET NULL"), nullable=True)
    score = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow_naive)

    user = relationship("User", back_populates="game_scores")

    __table_args__ = (
        Index("ix_game_scores_topic_progress", "user_id", "game_type", "language_pair_id", "topic_id", "score"),
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow_naive)


class DeviceSession(Base):
    __tablename__ = "device_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    device_id = Column(String(64), nullable=False)
    device_name = Column(String(120), nullable=False)
    refresh_token_hash = Column(String(64), unique=True, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow_naive, nullable=False)
    last_used_at = Column(DateTime, default=utcnow_naive, nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "device_id", name="uq_user_device_session"),)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    chat_message_id = Column(
        Integer,
        ForeignKey(
            "chat_messages.id",
            ondelete="CASCADE",
            name="fk_notifications_chat_message_id_chat_messages",
        ),
        nullable=True,
        index=True,
    )
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    kind = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow_naive)

    user = relationship("User", back_populates="notifications")


class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_date = Column(Date, nullable=False)
    code = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    target = Column(Integer, nullable=False)
    progress = Column(Integer, default=0)
    xp_reward = Column(Integer, default=20)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow_naive)

    __table_args__ = (
        UniqueConstraint("user_id", "challenge_date", "code", name="uq_user_daily_challenge"),
    )
