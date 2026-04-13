import os
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[3]
MODEL_DIR = ROOT_DIR / "Model"

sys.path.insert(0, str(MODEL_DIR))
os.chdir(MODEL_DIR)
