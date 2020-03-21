import pytest
from weatherwizard import WeatherWizard

CITY = 6094817  # Ottawa


@pytest.fixture
def weather_wizard():
    return WeatherWizard()


def test_weather_call(weather_wizard):
    weather_wizard.set_city(CITY)
    result = weather_wizard.weather()
    assert isinstance(result, dict)


def test_city_not_defined(weather_wizard):
    with pytest.raises(Exception):
        weather_wizard.weather()


def test_raise_invalid_city(weather_wizard):
    with pytest.raises(Exception):
        weather_wizard.set_city(-1)
        weather_wizard.weather()
