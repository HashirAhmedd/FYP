import hashlib
import importlib
import json
import os
from datetime import datetime, timezone

try:
    pymongo_mod = importlib.import_module("pymongo")
    ASCENDING = getattr(pymongo_mod, "ASCENDING", 1)
    MongoClient = getattr(pymongo_mod, "MongoClient", None)
    ReturnDocument = getattr(pymongo_mod, "ReturnDocument", None)
except Exception:
    ASCENDING = 1
    MongoClient = None
    ReturnDocument = None


COLLECTION_NAME = "xai_llm_insights"


class XAILLMInsightCache:
    def __init__(self):
        self._collection = None
        self._enabled = False

        mongo_uri = os.getenv("MONGODB_URI")
        db_name = os.getenv("MONGODB_DB", "climax-ai")

        if not mongo_uri or MongoClient is None:
            return

        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            database = client[db_name]
            collection = database[COLLECTION_NAME]
            collection.create_index([("cache_key", ASCENDING)], unique=True)
            collection.create_index(
                [
                    ("normalized_params.country", ASCENDING),
                    ("normalized_params.sector", ASCENDING),
                    ("normalized_params.gas", ASCENDING),
                    ("normalized_params.year", ASCENDING),
                ],
                unique=True,
                name="uniq_normalized_params_core",
            )
            self._collection = collection
            self._enabled = True
        except Exception:
            self._enabled = False

    @property
    def enabled(self):
        return self._enabled

    @staticmethod
    def build_cache_key(payload):
        encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
        return hashlib.sha256(encoded.encode("utf-8")).hexdigest()

    @staticmethod
    def _normalized_params_filter(normalized_params):
        return {
            "normalized_params": {"$type": "object"},
            "normalizedParams": {"$exists": False},
            "normalized_params.country": normalized_params.get("country"),
            "normalized_params.sector": normalized_params.get("sector"),
            "normalized_params.gas": normalized_params.get("gas"),
            "normalized_params.year": normalized_params.get("year"),
        }

    def get(self, cache_key):
        if not self._enabled:
            return None
        try:
            return self._collection.find_one({"cache_key": cache_key})
        except Exception:
            return None

    def get_by_normalized_params(self, normalized_params):
        if not self._enabled:
            return None
        try:
            return self._collection.find_one(
                self._normalized_params_filter(normalized_params),
                sort=[("created_at", -1)],
            )
        except Exception:
            return None

    def save(self, cache_key, normalized_params, insight_text, provider_used):
        if not self._enabled or not insight_text:
            return None
        try:
            return self._collection.find_one_and_update(
                self._normalized_params_filter(normalized_params),
                {
                    "$set": {
                        "cache_key": cache_key,
                        "normalized_params": normalized_params,
                        "insight_text": insight_text,
                        "provider_used": provider_used,
                        "updated_at": datetime.now(timezone.utc),
                    },
                    "$setOnInsert": {
                        "created_at": datetime.now(timezone.utc),
                    }
                },
                upsert=True,
                return_document=ReturnDocument.AFTER if ReturnDocument else None,
            )
        except Exception:
            return None
