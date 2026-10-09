import re
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DeviceSession, RefreshToken, User
from app.rate_limit import limiter
from app.schemas import (
    EmailPasswordLogin,
    EmailPasswordSignup,
    LogoutRequest,
    RefreshRequest,
    DeviceSessionOut,
    Token,
    UserOut,
)
from app.security import (
    REFRESH_TOKEN_EXPIRE_DAYS,
    create_access_token,
    generate_raw_token,
    get_current_user,
    hash_password,
    hash_token,
    verify_password,
)
from app.time_utils import utcnow_naive

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _request_device(request: Request) -> tuple[Optional[str], Optional[str]]:
    device_id = request.headers.get("x-device-id")
    if device_id is None:
        return None, None
    if not re.fullmatch(r"[A-Za-z0-9-]{16,64}", device_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid device session identifier")
    device_name = request.headers.get("x-device-name", "Unknown device")
    device_name = "".join(character for character in device_name if character.isprintable()).strip()[:120]
    return device_id, device_name or "Unknown device"


def _issue_tokens(
    db: Session,
    user: User,
    device_id: Optional[str] = None,
    device_name: Optional[str] = None,
) -> Token:
    raw_refresh = generate_raw_token()
    refresh_hash = hash_token(raw_refresh)
    session = None
    if device_id:
        session = db.query(DeviceSession).filter(
            DeviceSession.user_id == user.id,
            DeviceSession.device_id == device_id,
        ).first()
        if session and session.revoked:
            db.delete(session)
            db.flush()
            session = None
        if session:
            old_token = db.query(RefreshToken).filter(
                RefreshToken.token_hash == session.refresh_token_hash,
                RefreshToken.revoked.is_(False),
            ).first()
            if old_token:
                old_token.revoked = True
            session.device_name = device_name or session.device_name
            session.refresh_token_hash = refresh_hash
            session.revoked = False
            session.last_used_at = utcnow_naive()
        else:
            session = DeviceSession(
                user_id=user.id,
                device_id=device_id,
                device_name=device_name or "Unknown device",
                refresh_token_hash=refresh_hash,
                last_used_at=utcnow_naive(),
            )
            db.add(session)
            db.flush()

    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=refresh_hash,
            expires_at=utcnow_naive() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    db.commit()
    if session:
        db.refresh(session)
    access_claims = {"sub": str(user.id)}
    if session:
        access_claims["sid"] = session.id
    access_token = create_access_token(access_claims)
    return Token(access_token=access_token, refresh_token=raw_refresh)


@router.post("/login/password", response_model=Token)
@limiter.limit("10/minute")
def password_login(request: Request, payload: EmailPasswordLogin, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _issue_tokens(db, user, *_request_device(request))


@router.post("/register", response_model=Token)
@limiter.limit("5/minute")
def register(request: Request, payload: EmailPasswordSignup, db: Session = Depends(get_db)):
    email = payload.email
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account already exists for this email.")
    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        first_name="",
        last_name="",
        interface_language="tj",
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account already exists for this email.",
        ) from error
    return _issue_tokens(db, user, *_request_device(request))


@router.post("/password/reset-device", response_model=Token)
@limiter.limit("5/hour")
def reset_password_on_device(
    request: Request,
    payload: EmailPasswordLogin,
    db: Session = Depends(get_db),
):
    email = payload.email.casefold()
    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    device_id, device_name = _request_device(request)
    if not device_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Password recovery is only available on a previously used device.")
    prior_session = db.query(DeviceSession).filter(
        DeviceSession.user_id == user.id,
        DeviceSession.device_id == device_id,
    ).first()
    if not prior_session:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Password recovery is only available on a previously used device.")

    user.hashed_password = hash_password(payload.password)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id, RefreshToken.revoked.is_(False)
    ).update({"revoked": True})
    db.query(DeviceSession).filter(
        DeviceSession.user_id == user.id,
        DeviceSession.revoked.is_(False),
    ).update({"revoked": True})
    db.commit()
    return _issue_tokens(db, user, device_id, device_name)


@router.post("/refresh", response_model=Token)
@limiter.limit("30/minute")
def refresh(request: Request, payload: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hash_token(payload.refresh_token)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if not stored or stored.revoked or stored.expires_at < utcnow_naive():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == stored.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    device_id, device_name = _request_device(request)
    if device_id:
        session = db.query(DeviceSession).filter(
            DeviceSession.user_id == user.id,
            DeviceSession.device_id == device_id,
        ).first()
        if session and (session.revoked or session.refresh_token_hash != token_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired device session")
        if not session:
            session = DeviceSession(
                user_id=user.id,
                device_id=device_id,
                device_name=device_name or "Unknown device",
                refresh_token_hash=token_hash,
                last_used_at=utcnow_naive(),
            )
            db.add(session)
            db.commit()
    stored.revoked = True
    if device_id:
        session.last_used_at = utcnow_naive()
    return _issue_tokens(db, user, device_id, device_name)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    payload: LogoutRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(payload.refresh_token)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if stored:
        stored.revoked = True
        device_id, _ = _request_device(request)
        if device_id:
            session = db.query(DeviceSession).filter(
                DeviceSession.user_id == stored.user_id,
                DeviceSession.device_id == device_id,
                DeviceSession.refresh_token_hash == token_hash,
            ).first()
            if session:
                session.revoked = True
        db.commit()


@router.get("/sessions", response_model=list[DeviceSessionOut])
def list_device_sessions(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device_id, _ = _request_device(request)
    sessions = (
        db.query(DeviceSession)
        .filter(DeviceSession.user_id == current_user.id, DeviceSession.revoked.is_(False))
        .order_by(DeviceSession.last_used_at.desc(), DeviceSession.id.desc())
        .all()
    )
    return [
        {
            "id": session.id,
            "device_id": session.device_id,
            "device_name": session.device_name,
            "created_at": session.created_at,
            "last_used_at": session.last_used_at,
            "is_current": session.device_id == device_id,
        }
        for session in sessions
    ]


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_device_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(DeviceSession).filter(
        DeviceSession.id == session_id,
        DeviceSession.user_id == current_user.id,
        DeviceSession.revoked.is_(False),
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device session not found")
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token_hash == session.refresh_token_hash,
        RefreshToken.revoked.is_(False),
    ).first()
    if refresh_token:
        refresh_token.revoked = True
    session.revoked = True
    db.commit()


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
