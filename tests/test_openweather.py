import pytest
from openweather import OpenWeatherMap, OpenWeatherException

CITY = (6094817, "Ottawa")


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
    assert isinstance(open_weather.action("weather", CITY[0]), dict)


def test_raises_unlisted_action(open_weather):
    with pytest.raises(OpenWeatherException):
        open_weather.action("unknown", CITY[0])


def test_raises_missing_api_key(open_weather_unknown_key):
    with pytest.raises(FileNotFoundError):
        open_weather_unknown_key.action("weather", CITY[0])


def test_find_specific_city():
    found_city = OpenWeatherMap.search_city(CITY[1])
    assert isinstance(found_city, list)
    assert len(found_city) == 4  # There are three Ottawa's in USA and one in Canada
    assert CITY[0] in [id_ for id_, _, __ in found_city]


def test_find_no_city(open_weather):
    found_city = OpenWeatherMap.search_city("Undefined")
    assert not found_city
