from openweather import OpenWeatherMap, OpenWeatherException


class WeatherWizard:
    ANIMATION_SUN = "anim_sunny"
    ANIMATION_RAIN = "anim_rain"
    ANIMATION_CLOUDS = "anim_cloudy"
    ANIMATION_SNOW = "anim_snowy"
    ANIMATION_COLD = "anim_cold"
    ANIMATION_HOT = "anim_hot"

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
        self.__city = city if city else 0
        self.__precision = 2

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
        if not self.__city:
            raise Exception("City was not defined.")

        try:
            # request.status_code
            ow = OpenWeatherMap()

            # Get data from city and store useful content
            response = ow.action("weather", self.__city)

            # Decide animation
            animation = self.__set_animation(response)

            self.__last_response = {
                "cod": response["cod"],
                "city": response["name"],
                "country": response["sys"]["country"],
                "temperature": self.__set_precision(self.kelvin_to_celsius(response["main"]["temp"])),
                "wind": self.__set_precision(self.ms_to_kmh(response["wind"]["speed"])),
                "feels_like": self.__set_precision(self.kelvin_to_celsius(response["main"]["feels_like"])),
                "animation": animation
            }

            # Reset error message if any
            self.__error = ""

        # TODO owe and e must not be equal
        except OpenWeatherException as owe:
            self.__reset()
            self.__error = "Error running OpenWeather: " + owe.get_message()
            raise Exception(self.__error)

        return self.__last_response

    def set_city(self, city):
        self.__city = city

    def __set_animation(self, response):
        # Assuming response is a valid return from OpenWeather
        # TODO reorganize to mix wind/feels_like/rain|snow
        if response["main"]["feels_like"] < 0.0:
            return self.ANIMATION_COLD
        elif response["main"]["feels_like"] > 30.0:
            return self.ANIMATION_HOT

        return self.ANIMATION_SUN

    def __reset(self):
        self.__last_response = self.__last_response_model
        self.__error = ""

    # TODO validate city
    def __set_city(self, city):
        self.__city = city

    def __set_precision(self, number):
        return round(number, self.__precision)

    @classmethod
    def kelvin_to_celsius(cls, temperature):
        return temperature - 273.15

    @classmethod
    def ms_to_kmh(cls, speed):
        return speed * 3.6
