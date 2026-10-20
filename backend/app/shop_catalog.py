"""Static catalog for the profile shop.

Items are bought with earned coins. Categories:
- shield_streak: protects the daily streak for one missed day (consumable)
- gift_*: gifts delivered directly into a friend's chat (consumable)
- lion_*: clothes for the Lingolion lion mascot (permanent, equip/unequip, combinable)

Profile pictures are intentionally NOT sold here: every learner uploads their
own photo from the device gallery (stored on the account as ``avatar_url``).
"""

SHIELD = "shield"
GIFT = "gift"
LION_OUTFIT = "lion_outfit"

SHOP_ITEMS = [
    # Streak shield
    {"code": "shield_streak", "category": SHIELD, "price": 100, "emoji": "🛡️"},
    # Gifts for friends — each one is sent as a message in the friend's chat
    {"code": "gift_card", "category": GIFT, "price": 15, "emoji": "💌"},
    {"code": "gift_candy", "category": GIFT, "price": 20, "emoji": "🍬"},
    {"code": "gift_balloons", "category": GIFT, "price": 25, "emoji": "🎈"},
    {"code": "gift_flower", "category": GIFT, "price": 35, "emoji": "🌹"},
    {"code": "gift_chocolate", "category": GIFT, "price": 40, "emoji": "🍫"},
    {"code": "gift_coffee", "category": GIFT, "price": 45, "emoji": "☕"},
    {"code": "gift_cookie", "category": GIFT, "price": 50, "emoji": "🍪"},
    {"code": "gift_ice_cream", "category": GIFT, "price": 55, "emoji": "🍦"},
    {"code": "gift_cake", "category": GIFT, "price": 60, "emoji": "🎂"},
    {"code": "gift_heart", "category": GIFT, "price": 65, "emoji": "💝"},
    {"code": "gift_pizza", "category": GIFT, "price": 70, "emoji": "🍕"},
    {"code": "gift_lion_plush", "category": GIFT, "price": 90, "emoji": "🧸"},
    {"code": "gift_bouquet", "category": GIFT, "price": 100, "emoji": "💐"},
    {"code": "gift_puppy", "category": GIFT, "price": 150, "emoji": "🐶"},
    {"code": "gift_fireworks", "category": GIFT, "price": 250, "emoji": "🎆"},
    {"code": "gift_trophy", "category": GIFT, "price": 350, "emoji": "🏆"},
    {"code": "gift_unicorn", "category": GIFT, "price": 600, "emoji": "🦄"},
    {"code": "gift_diamond", "category": GIFT, "price": 800, "emoji": "💎"},
    {"code": "gift_crown", "category": GIFT, "price": 1500, "emoji": "👑"},
    # Lion mascot outfits (combinable — the lion can wear several at once)
    {"code": "lion_bowtie", "category": LION_OUTFIT, "price": 60, "emoji": "🎀"},
    {"code": "lion_cap", "category": LION_OUTFIT, "price": 70, "emoji": "🧢"},
    {"code": "lion_glasses", "category": LION_OUTFIT, "price": 80, "emoji": "👓"},
    {"code": "lion_scarf", "category": LION_OUTFIT, "price": 85, "emoji": "🧣"},
    {"code": "lion_tshirt", "category": LION_OUTFIT, "price": 95, "emoji": "👕"},
    {"code": "lion_hat", "category": LION_OUTFIT, "price": 110, "emoji": "🎩"},
    {"code": "lion_sunglasses", "category": LION_OUTFIT, "price": 120, "emoji": "🕶️"},
    {"code": "lion_sneakers", "category": LION_OUTFIT, "price": 130, "emoji": "👟"},
    {"code": "lion_jacket", "category": LION_OUTFIT, "price": 150, "emoji": "🧥"},
    {"code": "lion_crown", "category": LION_OUTFIT, "price": 200, "emoji": "👑"},
]

SHOP_ITEMS_BY_CODE = {item["code"]: item for item in SHOP_ITEMS}

CATEGORIES = (SHIELD, GIFT, LION_OUTFIT)


def get_item(item_code: str):
    return SHOP_ITEMS_BY_CODE.get(item_code)
