import pytest
from weatherwizard import WeatherWizard

CITY = 6094817  # Ottawa


@pytest.fixture
def weather_wizard():
    return WeatherWizard()


@pytest.fixture
def mocked_weather_city():
    with open("example-weather.json") as file:
        data = file.read()
        file.close()

    return data


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


def test_kelvin_to_celsius():
    assert WeatherWizard.kelvin_to_celsius(0) == -273.15


def test_ms_to_kmh():
    assert WeatherWizard.ms_to_kmh(1) == 3.6
