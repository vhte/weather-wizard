from openweather import OpenWeatherMap, OpenWeatherException
from neural import NeuralNetwork, NeuralException


class WeatherWizard:
    def __init__(self, city):
        self.__ow = OpenWeatherMap()
        self.__last_response_model = {"cod": 0, "method": "", "vehicle": "", "response": False}
        self.__last_response = self.__last_response_model
        self.__city = city
        self.__error = ""

    def weather(self):
        """
        Abstracts a human readable weather for the current time

        Args

        Raises
            OpenWeatherException: A unexpected behavior when calling OpenWeather API
        Returns
            __last_response (dict): Dictionary in format {"cod": (int), "method": (str), "vehicle": (str), "response": (bool)}
        """
        try:
            neural = NeuralNetwork()
            method = "weather"
            vehicle = "bike"

            # request.status_code
            response = neural.classify(method, self.__ow.action(method, self.__city))

            self.__last_response.cod = 1
            self.__last_response.method = method
            self.__last_response.vehicle = vehicle
            self.__last_response.response = response
            self.__error = ""
        except OpenWeatherException as owe:
            self.__reset()
            self.__last_response.cod = -1
            self.__error = "Error running OpenWeather: " + owe.get_message()
        except NeuralException as nn:
            self.__reset()
            self.__last_response.cod = -1
            self.__error = "Neural network error: " + nn.get_message()

        return self.__last_response

    def __reset(self):
        self.__last_response = self.__last_response_model
        self.__error = ""

    @classmethod
    def kelvin_to_celsius(cls, temperature):
        return temperature - 273.15

    @classmethod
    def ms_to_kmh(cls, speed):
        return speed * 3.6

