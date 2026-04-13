from pathlib import Path

import pytest
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions


ROOT_DIR = Path(__file__).resolve().parents[3]
FIXTURE_URL = (
    ROOT_DIR / "tests" / "blackbox" / "e2e" / "fixtures" / "mock-fyp-app.html"
).resolve().as_uri()


@pytest.fixture(scope="session")
def e2e_url():
    return FIXTURE_URL


@pytest.fixture(scope="session")
def browser():
    drivers = []

    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1440,1200")
    drivers.append(lambda: webdriver.Chrome(options=chrome_options))

    edge_options = EdgeOptions()
    edge_options.add_argument("--headless=new")
    edge_options.add_argument("--window-size=1440,1200")
    drivers.append(lambda: webdriver.Edge(options=edge_options))

    last_error = None
    for factory in drivers:
        try:
            driver = factory()
            yield driver
            driver.quit()
            return
        except WebDriverException as error:
            last_error = error

    pytest.skip(f"No Selenium browser driver was available: {last_error}")
