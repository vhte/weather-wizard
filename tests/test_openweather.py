import pytest
from openweather import OpenWeatherMap, OpenWeatherException

CITY = 6094817  # Ottawa


@pytest.fixture
def open_weather():
    return OpenWeatherMap()


@pytest.fixture
def open_weather_unknown_key(monkeypatch):
    monkeypatch.setattr(OpenWeatherMap, "API_KEY", "missing.key")
    return OpenWeatherMap()


def test_can_instantiate(open_weather):
    assert isinstance(open_weather, OpenWeatherMap)


def test_get_weather(open_weather):
    assert isinstance(open_weather.action("weather", CITY), dict)


def test_raises_unlisted_action(open_weather):
    with pytest.raises(OpenWeatherException):
        open_weather.action("unknown", CITY)


def test_raises_missing_api_key(open_weather_unknown_key):
    with pytest.raises(OpenWeatherException):
        open_weather_unknown_key.action("weather", CITY)
