from openweather import OpenWeatherMap, OpenWeatherException


class WeatherWizard:
    ANIMATION_SUN = "anim_sunny"
    ANIMATION_RAIN = "anim_rain"
    ANIMATION_CLOUDS = "anim_cloudy"
    ANIMATION_SNOW = "anim_snowy"

    def __init__(self, city):
        self.__ow = OpenWeatherMap()
        self.__last_response_model = {
            "cod": 0,
            "city": "",
            "country": "",
            "temperature": 0.0,
            "wind": 0.0,
            "animation": "",
        }
        self.__last_response = self.__last_response_model
        self.__city = city
        self.__error = ""

    def weather(self, city):
        """
        Get weather information about a chosen city

        Args
            city:
        Raises
            OpenWeatherException: A unexpected behavior when calling OpenWeather API
        Returns
            __last_response (dict): Dictionary in format {"cod": (int), "city": (str), "country": (str), "temperature": (real), "wind": (real), "animation": (str)}
        """
        try:

            # request.status_code
            ow = OpenWeatherMap()
            response = ow.action("weather", city)

            self.__last_response.cod = response.cod
            self.__last_response.city = response.name
            self.__last_response.country = response.sys.country
            self.__last_response.temperature = self.kelvin_to_celsius(response.main.temp)
            self.__last_response.wind = self.ms_to_kmh(response.wind.speed)
            self.__last_response.animation = self.ANIMATION_SUN

            self.__error = ""
        except OpenWeatherException as owe:
            self.__reset()
            self.__last_response.cod = -1
            self.__error = "Error running OpenWeather: " + owe.get_message()

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
