from sqlalchemy.orm import Session
from core.cache import cache
from repositories.setting_repository import SettingRepository


DEFAULTS = {
    "business_info": {
        "business_name": "TagOn",
        "tagline": "Customized Gifts Crafted With Love",
        "address": "",
        "logo_url": "",
    },
    "qr_config": {
        "upi_id": "",
        "merchant_name": "TagOn",
        "qr_image_url": "",
    },
    "contact": {
        "phone": "",
        "email": "",
        "facebook": "",
        "instagram": "",
        "twitter": "",
    },
    "retention": {
        "default_points": 0,
        "referral_bonus": 0,
        "points_expiry_days": 365,
    },
    "preferences": {
        "currency": "INR",
        "timezone": "Asia/Kolkata",
        "auto_cancel_hours": 48,
        "low_stock_threshold": 5,
    },
}


class SettingsService:
    def __init__(self, db: Session):
        self.repo = SettingRepository(db)

    def get_group(self, group: str) -> dict:
        cache_key = f"settings:{group}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        setting = self.repo.get(group)
        result = setting.value if setting else DEFAULTS.get(group, {})
        cache.set(cache_key, result, ttl_seconds=300)
        return result

    def update_group(self, group: str, data: dict) -> dict:
        defaults = DEFAULTS.get(group, {})
        merged = {**defaults, **data}
        self.repo.set(group, merged)
        cache.delete(f"settings:{group}")
        return merged
