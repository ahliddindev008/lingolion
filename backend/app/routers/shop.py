from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChatMessage, User, UserInventoryItem
from app.routers.communication import _notify_room, _partner_room
from app.security import get_current_user
from app.shop_catalog import GIFT, LION_OUTFIT, SHOP_ITEMS, get_item
from app.social import shares_language_pair
from app.websocket_manager import manager

router = APIRouter(prefix="/api/shop", tags=["shop"])

# Gifts are delivered as a chat message so they appear in the friend's chat:
# "gift:<item_code>|<emoji>" (rendered as a gift bubble by the chat UI).
GIFT_PREFIX = "gift:"


class ShopBuyRequest(BaseModel):
    item_code: str = Field(min_length=1, max_length=50)


class ShopEquipRequest(BaseModel):
    item_code: str = Field(min_length=1, max_length=50)


class ShopGiftRequest(BaseModel):
    item_code: str = Field(min_length=1, max_length=50)
    recipient_id: int = Field(ge=1)


class ShopItemOut(BaseModel):
    code: str
    category: str
    price: int
    emoji: str
    quantity: int = 0
    owned: bool = False
    is_equipped: bool = False


def _inventory_map(db: Session, user_id: int) -> dict:
    rows = db.query(UserInventoryItem).filter(UserInventoryItem.user_id == user_id).all()
    return {row.item_code: row for row in rows}


def _item_out(item: dict, row) -> ShopItemOut:
    return ShopItemOut(
        code=item["code"],
        category=item["category"],
        price=item["price"],
        emoji=item["emoji"],
        quantity=row.quantity if row else 0,
        owned=row is not None,
        is_equipped=bool(row and row.is_equipped),
    )


def _is_friend(db: Session, sender_id: int, recipient_id: int) -> bool:
    """A friend is any user shown in the communication partner list.

    The partner list contains both same-direction and mirrored language pairs,
    so gifts must accept the same set of users (previously only mirrored
    pairs were allowed, which rejected friends learning the same direction).
    """
    return shares_language_pair(db, sender_id, recipient_id)


@router.get("/catalog", response_model=list[ShopItemOut])
def shop_catalog(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inventory = _inventory_map(db, current_user.id)
    return [_item_out(item, inventory.get(item["code"])) for item in SHOP_ITEMS]


@router.get("/inventory")
def shop_inventory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inventory = _inventory_map(db, current_user.id)
    return {
        "coins": current_user.coins or 0,
        "owned_codes": sorted(inventory.keys()),
        "equipped_codes": sorted(code for code, row in inventory.items() if row.is_equipped),
    }


@router.post("/buy", response_model=ShopItemOut)
def buy_item(
    payload: ShopBuyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = get_item(payload.item_code)
    if not item:
        raise HTTPException(status_code=404, detail="Unknown shop item")
    if item["category"] == GIFT:
        raise HTTPException(status_code=422, detail="Gifts must be sent with /api/shop/gift")

    row = (
        db.query(UserInventoryItem)
        .filter(UserInventoryItem.user_id == current_user.id, UserInventoryItem.item_code == item["code"])
        .first()
    )
    if item["category"] == LION_OUTFIT and row:
        raise HTTPException(status_code=409, detail="Item already owned")
    if (current_user.coins or 0) < item["price"]:
        raise HTTPException(status_code=402, detail="Not enough coins")

    current_user.coins = (current_user.coins or 0) - item["price"]
    if row:
        row.quantity = (row.quantity or 1) + 1
    else:
        row = UserInventoryItem(user_id=current_user.id, item_code=item["code"], quantity=1)
        db.add(row)
    db.commit()
    db.refresh(row)
    return _item_out(item, row)


@router.post("/equip", response_model=ShopItemOut)
def equip_outfit(
    payload: ShopEquipRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = get_item(payload.item_code)
    if not item or item["category"] != LION_OUTFIT:
        raise HTTPException(status_code=404, detail="Item cannot be equipped")

    row = (
        db.query(UserInventoryItem)
        .filter(UserInventoryItem.user_id == current_user.id, UserInventoryItem.item_code == item["code"])
        .first()
    )
    if not row:
        raise HTTPException(status_code=409, detail="Item not owned yet")

    # Outfits are combinable: toggling one never removes the others, so the
    # lion mascot can wear several clothes at the same time.
    row.is_equipped = not row.is_equipped
    db.commit()
    db.refresh(row)
    return _item_out(item, row)


@router.post("/gift")
async def send_gift(
    payload: ShopGiftRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = get_item(payload.item_code)
    if not item or item["category"] != GIFT:
        raise HTTPException(status_code=404, detail="Gift item not found")
    if payload.recipient_id == current_user.id:
        raise HTTPException(status_code=422, detail="Cannot send a gift to yourself")

    recipient = db.query(User).filter(User.id == payload.recipient_id, User.is_active.is_(True)).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    if not _is_friend(db, current_user.id, recipient.id):
        raise HTTPException(status_code=403, detail="Recipient is not your practice partner")
    if (current_user.coins or 0) < item["price"]:
        raise HTTPException(status_code=402, detail="Not enough coins")

    current_user.coins = (current_user.coins or 0) - item["price"]

    # The gift lands in the FRIEND'S CHAT (never on their profile page): a
    # regular chat message plus the usual unread-chat notification for that room.
    room = _partner_room(current_user.id, recipient.id)
    message = ChatMessage(
        room=room,
        sender_id=current_user.id,
        is_ai=False,
        content=f"{GIFT_PREFIX}{item['code']}|{item['emoji']}",
    )
    db.add(message)
    db.flush()
    _notify_room(
        db,
        room,
        current_user.id,
        f"{current_user.first_name} sent you a gift {item['emoji']}",
        message.id,
    )
    db.commit()
    db.refresh(message)

    await manager.broadcast(
        room,
        {
            "id": message.id,
            "room": room,
            "sender_id": current_user.id,
            "is_ai": False,
            "content": message.content,
            "reply_to_id": None,
            "reply_to": None,
            "created_at": message.created_at.isoformat(),
            "sender_name": None,
        },
    )
    return {
        "status": "sent",
        "item_code": item["code"],
        "recipient_id": recipient.id,
        "coins": current_user.coins,
        "room": room,
        "message_id": message.id,
    }


