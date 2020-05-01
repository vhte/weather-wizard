import os
import requests
import gzip
from definitions import ROOT_DIR
from ast import literal_eval


class OpenWeatherMap:
    API_URL = "http://api.openweathermap.org/data/2.5/"
    API_KEY = "api.key"
    ACTIONS = {
        "weather": "weather",
        "forecast": "forecast"
        # TODO temp map
    }
    ALL_CITIES_FILE = os.path.join(ROOT_DIR, "static", "history.city.list.json.gz")

    def __init__(self):
        self.__file = os.path.join(os.path.dirname(__file__), self.API_KEY)
        self.__key = ""
        self.__last_call = ""

    def __get_key(self):
        if not self.__key:
            try:
                file = open(self.__file, "r")
                key = file.read().replace(" ", "")
                if int(key, 16) and len(key) != 32:
                    raise OpenWeatherException(
                        "API Key invalid. Must be exactly 32 chars."
                    )
            except FileNotFoundError:
                raise FileNotFoundError(
                    "File api.key was not found. Add the OpenWeather API key inside that file."
                )
            except ValueError:
                raise ValueError("The API key is not hexadecimal valid.")
            else:
                file.close()
                self.__key = key

        return self.__key

    def __request(self, method, city):
        # Construct api url and call
        self.__last_call = "{}{}?id={}&APPID={}".format(
            self.API_URL, self.ACTIONS[method], str(city), self.__get_key()
        )
        response = requests.get(self.__last_call)
        if response:
            return response.json()
        # TODO identify { "cod":401 }

    def action(self, method, city):
        method = method.lower()
        if method not in self.ACTIONS:
            raise OpenWeatherException(
                "Action {} not found in defined action list: {}".format(
                    method, list(self.ACTIONS.keys())
                )
            )

        return self.__request(method, city)

    @staticmethod
    def search_city(city_name):
        with gzip.open(OpenWeatherMap.ALL_CITIES_FILE) as city_file:
            all_cities_bytes = city_file.read()
        all_cities_decoded = all_cities_bytes.decode("UTF-8")
        all_cities = literal_eval(all_cities_decoded)
        city_name = city_name.upper()

        matches = []
        for match in all_cities:
            if match["city"]["findname"] == city_name:
                id_ = match["id"]
                if isinstance(id_, dict):
                    id_ = int(match["id"]["$numberLong"])
                matches.append([id_, match["city"]["country"], match["city"]["coord"]])
        return matches

    def get_last_call(self):
        return self.__last_call


# TODO Add origin __method__ for debug purposes
class OpenWeatherException(BaseException):
    def __init__(self, message):
        self.__message = message

    def get_message(self):
        return self.__message
