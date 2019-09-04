class OpenWeatherMap:
    def __init__(self):
        self.__file = "api.key"
        self.__key = ""

    def get_key(self):
        if not self.__key:
            try:
                file = open(self.__file, "r")
            except FileNotFoundError:
                raise OpenWeatherException("File api.key was not found. Add the OpenWeather API key inside that file.")
            else:
                self.__key = file.read()
                file.close()

        return self.__key


class OpenWeatherException(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.__message = message

    def get_message(self):
        return self.__message
