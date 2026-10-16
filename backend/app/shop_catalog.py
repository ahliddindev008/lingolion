"""Static catalog for the profile shop.

Items are bought with earned coins. Categories:
- sticker_*: chat/profile stickers (consumable, stacked by quantity)
- shield_streak: protects the daily streak for one missed day (consumable)
- gift_*: gifts that can be sent to friends (consumable)
- lion_*: clothes for the Lingolion lion mascot (permanent, equip/unequip)
"""

STICKER = "sticker"
SHIELD = "shield"
GIFT = "gift"
LION_OUTFIT = "lion_outfit"

SHOP_ITEMS = [
    # Stickers
    {"code": "sticker_wave", "category": STICKER, "price": 15, "emoji": "👋"},
    {"code": "sticker_fire", "category": STICKER, "price": 25, "emoji": "🔥"},
    {"code": "sticker_heart", "category": STICKER, "price": 30, "emoji": "❤️"},
    {"code": "sticker_party", "category": STICKER, "price": 40, "emoji": "🎉"},
    # Streak shield
    {"code": "shield_streak", "category": SHIELD, "price": 100, "emoji": "🛡️"},
    # Gifts for friends
    {"code": "gift_flower", "category": GIFT, "price": 35, "emoji": "🌹"},
    {"code": "gift_cake", "category": GIFT, "price": 60, "emoji": "🎂"},
    {"code": "gift_lion_plush", "category": GIFT, "price": 90, "emoji": "🧸"},
    # Lion mascot outfits
    {"code": "lion_cap", "category": LION_OUTFIT, "price": 70, "emoji": "🧢"},
    {"code": "lion_scarf", "category": LION_OUTFIT, "price": 85, "emoji": "🧣"},
    {"code": "lion_sunglasses", "category": LION_OUTFIT, "price": 120, "emoji": "🕶️"},
    {"code": "lion_crown", "category": LION_OUTFIT, "price": 200, "emoji": "👑"},
]

SHOP_ITEMS_BY_CODE = {item["code"]: item for item in SHOP_ITEMS}

CATEGORIES = (STICKER, SHIELD, GIFT, LION_OUTFIT)


def get_item(item_code: str):
    return SHOP_ITEMS_BY_CODE.get(item_code)
