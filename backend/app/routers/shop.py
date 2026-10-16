from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Notification, User, UserInventoryItem
from app.security import get_current_user
from app.shop_catalog import GIFT, LION_OUTFIT, SHOP_ITEMS, get_item
from app.social import is_practice_partner

router = APIRouter(prefix="/api/shop", tags=["shop"])


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
    """A friend is a user sharing a mirrored language pair with the sender."""
    return is_practice_partner(db, sender_id, recipient_id)


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
        raise HTTPException(status_code=409, detail="Outfit already owned")
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
        raise HTTPException(status_code=404, detail="Outfit not found")

    row = (
        db.query(UserInventoryItem)
        .filter(UserInventoryItem.user_id == current_user.id, UserInventoryItem.item_code == item["code"])
        .first()
    )
    if not row:
        raise HTTPException(status_code=409, detail="Outfit not owned yet")

    outfit_codes = tuple(entry["code"] for entry in SHOP_ITEMS if entry["category"] == LION_OUTFIT)
    target_state = not row.is_equipped
    db.query(UserInventoryItem).filter(
        UserInventoryItem.user_id == current_user.id,
        UserInventoryItem.item_code.in_(outfit_codes),
    ).update({"is_equipped": False}, synchronize_session=False)
    row.is_equipped = target_state
    db.commit()
    db.refresh(row)
    return _item_out(item, row)


@router.post("/gift")
def send_gift(
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
    db.add(
        Notification(
            user_id=recipient.id,
            title="Gift from a friend",
            message=f"{current_user.first_name} sent you a gift {item['emoji']} ({item['code']})",
            kind="gift",
        )
    )
    db.commit()
    return {"status": "sent", "item_code": item["code"], "recipient_id": recipient.id, "coins": current_user.coins}


