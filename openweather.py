import requests


class OpenWeatherMap:
    API_URL = "http://api.openweathermap.org/data/2.5/"
    ACTIONS = {
        "weather": "weather",
        "forecast": "forecast"
        # TODO temp map
    }

    def __init__(self):
        self.__file = "api.key"
        self.__key = ""
        self.__last_call = ""

    def __get_key(self):
        if not self.__key:
            try:
                file = open(self.__file, "r")
                key = file.read().replace(" ", "")
                if int(key, 16) and len(key) != 32:
                    raise OpenWeatherException("API Key invalid. Must be exactly 32 chars.")
            except FileNotFoundError:
                raise OpenWeatherException("File api.key was not found. Add the OpenWeather API key inside that file.")
            except ValueError:
                raise OpenWeatherException("The API key is not hexadecimal valid.")
            else:
                file.close()
                self.__key = key

        return self.__key

    def __request(self, method, city):
        # Construct api url and call
        self.__last_call = self.API_URL + self.ACTIONS[method] + "?id=" + str(city) + "&APPID=" + self.__get_key()
        response = requests.get(self.__last_call)
        if response:
            return response.json()
        # TODO identify { "cod":401 }

    def action(self, method, city):
        method = method.lower()
        if not self.ACTIONS[method]:
            for key in self.ACTIONS.keys():
                keys = key + ", "
            raise OpenWeatherException("Action " + method + " not found in defined action list: " + keys.rstrip(", "))

        return self.__request(method, city)

    def get_last_call(self):
        return self.__last_call


# TODO Add origin __method__ for debug purposes
class OpenWeatherException(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.__message = message

    def get_message(self):
        return self.__message
