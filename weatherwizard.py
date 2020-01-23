from openweather import OpenWeatherMap, OpenWeatherException


class WeatherWizard:
    ANIMATION_SUN = "anim_sunny"
    ANIMATION_RAIN = "anim_rain"
    ANIMATION_CLOUDS = "anim_cloudy"
    ANIMATION_SNOW = "anim_snowy"

    def __init__(self, city=False):
        self.__ow = OpenWeatherMap()
        self.__last_response_model = {
            "cod": 0,
            "city": "",
            "country": "",
            "temperature": 0.0,
            "wind": 0.0,
            "feels_like": 0.0,
            "animation": self.ANIMATION_SUN,
        }
        self.__last_response = self.__last_response_model
        if city:
            self.__city = city
        self.__error = ""

    def weather(self):
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

            # Get data from city and store useful content
            response = ow.action("weather", self.__city)

            self.__last_response = {
                "cod": response["cod"],
                "city": response["name"],
                "country": response["sys"]["country"],
                "temperature": self.kelvin_to_celsius(response["main"]["temp"]),
                "wind": self.ms_to_kmh(response["wind"]["speed"]),
                "feels_like": self.kelvin_to_celsius(response["main"]["feels_like"]),
                "animation": self.ANIMATION_CLOUDS
            }

            # Reset error message if any
            self.__error = ""

        # TODO owe and e must not be equal
        except OpenWeatherException as owe:
            self.__reset()
            self.__last_response["cod"] = -1
            self.__error = "Error running OpenWeather: " + owe.get_message()
        except Exception as e:
            self.__reset()
            self.__last_response["cod"] = -1
            self.__error = "Error running WeatherWizard: " + str(e)

        return self.__last_response

    def __reset(self):
        self.__last_response = self.__last_response_model
        self.__error = ""

    # TODO validate city
    def __set_city(self, city):
        self.__city = city

    @classmethod
    def kelvin_to_celsius(cls, temperature):
        return temperature - 273.15

    @classmethod
    def ms_to_kmh(cls, speed):
        return speed * 3.6
