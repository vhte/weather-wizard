from openweather import OpenWeatherMap, OpenWeatherException
from neural import NeuralNetwork, NeuralException

class WeatherWizard:
    def __init__(self, city):
        self.__ow = OpenWeatherMap()
        self.__last_response = {"cod": 0, "response": ""}
        self.__city = city

    def weather(self):
        """
        Abstracts a human readable weather for the current time

        Args

        Raises
            OpenWeatherException: A unexpected behavior when calling OpenWeather API
        Returns
            __last_response: Dictionary in format {"cod": (int), "response": (str)}
        """
        try:
            neural = NeuralNetwork()
            # request.status_code / json()
            self.__last_response = neural.classify("bike", self.__ow.action("weather", self.__city))
        except OpenWeatherException as owe:
            self.__last_response.cod = -1
            self.__last_response.response = "Error running OpenWeather: " + owe.get_message()
        except NeuralException as nn:
            self.__last_response.cod = -1
            self.__last_response.response = "Neural network error: " + nn.get_message()

        return self.__last_response

    @classmethod
    def kelvin_to_celsius(cls, temperature):
        return temperature - 273.15

    @classmethod
    def ms_to_kmh(cls, speed):
        return speed * 3.6

