from openweather import OpenWeatherMap, OpenWeatherException


class WeatherWizard:
    def __init__(self, city):
        self.__ow = OpenWeatherMap()
        self.__last_response = {"cod": 0, "response": ""}
        self.__city = city

    def tomorrow_forecast(self):
        """
        Abstracts a human readable forecast for the next day

        Args

        Raises
            OpenWeatherException: A unexpected behavior when calling OpenWeather API
        Returns
            __last_response: Dictionary in format {"cod": (int), "response": (str)}
        """
        try:
            forecast = self.__ow.action("forecast", self.__city)
            #TODO apply intelligence
            self.__last_response = forecast
            # request.status_code / json()
        except OpenWeatherException as owe:
            self.__last_response.cod = -1
            self.__last_response.response = "Error running OpenWeather: " + owe.get_message()

        return self.__last_response

