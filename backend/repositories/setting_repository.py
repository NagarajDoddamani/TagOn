from sqlalchemy.orm import Session
from models.setting import Setting


class SettingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, key: str):
        return self.db.query(Setting).filter(Setting.key == key).first()

    def set(self, key: str, value: dict) -> Setting:
        setting = self.get(key)
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def get_all(self) -> list:
        return self.db.query(Setting).all()
