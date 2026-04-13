from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def test_login_flow(browser, e2e_url):
    browser.get(e2e_url)

    browser.find_element(By.ID, "email").send_keys("qa@example.com")
    browser.find_element(By.ID, "password").send_keys("secret123")
    browser.find_element(By.ID, "login-btn").click()

    status = WebDriverWait(browser, 5).until(
        EC.visibility_of_element_located((By.ID, "auth-status")),
    )

    assert "qa@example.com" in status.text


def test_prediction_visualization_and_csv_download(browser, e2e_url):
    browser.get(e2e_url)

    browser.find_element(By.ID, "email").send_keys("qa@example.com")
    browser.find_element(By.ID, "password").send_keys("secret123")
    browser.find_element(By.ID, "login-btn").click()

    WebDriverWait(browser, 5).until(
        EC.text_to_be_present_in_element((By.ID, "auth-status"), "Logged in"),
    )

    browser.find_element(By.ID, "predict-btn").click()

    chart_title = WebDriverWait(browser, 5).until(
        EC.visibility_of_element_located((By.ID, "chart-title")),
    )
    assert chart_title.text == "Trend Visualization"

    browser.find_element(By.ID, "download-btn").click()

    download_status = WebDriverWait(browser, 5).until(
        EC.visibility_of_element_located((By.ID, "download-status")),
    )
    assert download_status.text == "CSV generated successfully"


def test_prediction_visualization_is_hidden_until_prediction_runs(browser, e2e_url):
    # Arrange
    browser.get(e2e_url)

    visualization = browser.find_element(By.ID, "visualization")
    download_status = browser.find_element(By.ID, "download-status")

    # Assert
    assert visualization.value_of_css_property("display") == "none"
    assert download_status.text == "Download pending"
