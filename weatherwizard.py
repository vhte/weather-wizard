from openweather import OpenWeatherMap, OpenWeatherException


class WeatherWizard():
    def __init__(self):
        self.__ow = OpenWeatherMap()

