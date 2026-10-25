r"""
L4 Seeding rule tests.
Verifies that starter demo content is only seeded in development,
leaving production clean for real school content entered by Admin.

Usage:
  .\venv\Scripts\python.exe test_seeding.py
"""

import os
import sys
import unittest.mock as mock

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.config import Settings
import app.main as main_module

failures = 0


def check(name: str, cond: bool, extra: str = ""):
    global failures
    status = "PASS: " if cond else "FAIL: "
    print(status + name + (f" -> {extra}" if not cond else ""))
    if not cond:
        failures += 1


print("=" * 60)
print("RUNNING L4 SEEDING RULES TEST SUITE")
print("=" * 60)

# Check dev settings
dev_settings = Settings(_env_file=None, ENVIRONMENT="development")
check("development: is_production is False", dev_settings.is_production is False)
should_seed_dev = not dev_settings.is_production or dev_settings.SEED_DEMO_CONTENT
check("development: should seed starter content", should_seed_dev is True)

# Check prod settings with default SEED_DEMO_CONTENT=False
prod_clean = Settings(
    _env_file=None,
    ENVIRONMENT="production",
    SECRET_KEY="x" * 48,
    ADMIN_PASSWORD="Str0ng-Admin-Pass!",
    FRONTEND_URL="https://www.littleflowersschools.com",
    SEED_DEMO_CONTENT=False,
)
check("production default: is_production is True", prod_clean.is_production is True)
should_seed_prod_clean = not prod_clean.is_production or prod_clean.SEED_DEMO_CONTENT
check("production default: does NOT seed sample slides/notices", should_seed_prod_clean is False)

# Check prod settings with explicit override SEED_DEMO_CONTENT=True
prod_override = Settings(
    _env_file=None,
    ENVIRONMENT="production",
    SECRET_KEY="x" * 48,
    ADMIN_PASSWORD="Str0ng-Admin-Pass!",
    FRONTEND_URL="https://www.littleflowersschools.com",
    SEED_DEMO_CONTENT=True,
)
should_seed_prod_override = not prod_override.is_production or prod_override.SEED_DEMO_CONTENT
check("production with SEED_DEMO_CONTENT=True: seeds content", should_seed_prod_override is True)

print("=" * 60)
if failures == 0:
    print("ALL L4 SEEDING TESTS PASSED!")
    sys.exit(0)
else:
    print(f"FAILED: {failures} test(s) failed.")
    sys.exit(1)
