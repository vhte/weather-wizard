import requests


class OpenWeatherMap:
    API_URL = "http://api.openweathermap.org/data/2.5/"
    ACTIONS = {
        "forecast": "forecast",
        "weather": "weather"
    }

    def __init__(self):
        self.__file = "api.key"
        self.__key = ""

    def __get_key(self):
        if not self.__key:
            try:
                file = open(self.__file, "r")
                key = file.read().replace(" ", "")
                if len(key) != 32:  # TODO validate real hex
                    raise OpenWeatherException("API Key invalid. Must be exactly 32 chars.")
            except FileNotFoundError:
                raise OpenWeatherException("File api.key was not found. Add the OpenWeather API key inside that file.")
            else:
                file.close()
                self.__key = key

        return self.__key

    def request(self, method, city):
        if not self.ACTIONS[method.lower()]:
            for key in self.ACTIONS.keys():
                keys = key + ", "
            raise OpenWeatherException("Action " + method + " not found in defined action list: " + keys.rstrip(", "))
        else:
            response = requests.get(self.API_URL + self.ACTIONS[method] + "?id=" + str(city) + "&APPID=" + self.__get_key())
            if response:
                return response.json()


# TODO Add origin __method__ for debug purposes
class OpenWeatherException(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.__message = message

    def get_message(self):
        return self.__message
