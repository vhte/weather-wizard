from datetime import datetime, timezone, timedelta
from openweather import OpenWeatherMap, OpenWeatherException
from alerts.alerts import Alerts


class WeatherWizard:
    ANIMATION = {
        # Independent
        0: "moon",
        1: "sun",
        2: "clouds",
        4: "rain",
        8: "snow",
        # Dependence
        16: "cold",
        32: "hot",
        64: "wind",
        128: "thunder",
    }

    def __init__(self, city=False):
        self.__ow = OpenWeatherMap()
        self.__last_response_model = {
            "cod": 0,
            "city": "",
            "country": "",
            "temperature": 0,
            "wind": 0,
            "feels_like": 0,
            "description": "",
            "animation": self.ANIMATION[1],
        }
        self.__last_response = self.__last_response_model
        self.__city = int(city) if city else 0
        # Temperature and wind precision
        self.__precision = 0

        self.__error = ""

    def weather(self, search_alerts=False):
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

            if response is None:
                raise ("City {} not found.".format(str(self.__city)))

            # Human readable conversions
            response["main"]["temp"] = self.kelvin_to_celsius(response["main"]["temp"])
            response["main"]["feels_like"] = self.kelvin_to_celsius(
                response["main"]["feels_like"]
            )
            response["wind"]["speed"] = self.ms_to_kmh(response["wind"]["speed"])

            # Decide animation
            animation = self.__set_animation(response)

            self.__last_response = {
                "cod": response["cod"],
                "city": response["name"],
                "country": response["sys"]["country"],
                "temperature": self.__set_precision(response["main"]["temp"]),
                "wind": self.__set_precision(response["wind"]["speed"]),
                "humidity": self.__set_precision(response["main"]["humidity"]),
                "feels_like": self.__set_precision(response["main"]["feels_like"]),
                "description": response["weather"][0]["description"].capitalize(),
                "animation": animation,
            }

            # Reset error message if any
            self.__error = ""

        except OpenWeatherException as owe:
            self.__reset()
            self.__error = "Error running OpenWeather: " + owe.get_message()
            # TODO do not terminate
            raise Exception(self.__error)

        # Check if should add alerts
        if search_alerts:
            try:
                # TODO Change try/catch by empty string when none
                alert = Alerts(self.__city)
                if alert.has_alert():
                    self.__last_response["alert"] = alert.get_message()
            except NotImplementedError as e:
                print("Couldn't get alert for city {}. Reason: {}".format(self.__city, str(e)))

        return self.__last_response

    def set_city(self, city):
        self.__city = city

    # Assuming response is a valid return from OpenWeather
    def __set_animation(self, response):
        # Bitwise operation
        bit = 1

        try:
            if "clouds" in response and response["clouds"]["all"] > 80:  # %
                bit = bit << 1  # 2
            if "weather" in response:
                events = [event["main"].lower() for event in response["weather"]]
                if "snow" in events:  # TODO thunderstorm, mist
                    bit = bit << 2  # 8
                elif "rain" in events:
                    bit = bit << 1  # 4

            # COLD vs HOT vs WIND
            if bit == 1:  # Only allowed if sky is clear
                if response["main"]["feels_like"] <= -20.0:
                    bit = bit << 4  # 16
                elif response["main"]["feels_like"] > 30.0:
                    bit = bit << 5  # 32
                elif response["wind"]["speed"] > 22.5:
                    bit = bit << 6
                else:
                    # Check for moon replacement
                    schedule = {
                        "now": datetime.now(timezone.utc) + timedelta(seconds=response["timezone"]),
                        "sunrise": datetime.fromtimestamp(response["sys"]["sunrise"]),
                        "sunset": datetime.fromtimestamp(response["sys"]["sunset"]),
                    }
                    schedule = {k: event.time() for k, event in schedule.items()}

                    if (
                        schedule["now"] < schedule["sunrise"]
                        or schedule["now"] > schedule["sunset"]
                    ):
                        bit = bit >> 1

        except KeyError as e:
            raise KeyError(
                "Invalid position {} for response. Dict: {}".format(
                    str(e), str(response)
                )
            )

        try:
            return self.ANIMATION[bit]
        except KeyError as e:
            raise KeyError("Bit {} was not mapped correctly.".format(bit))

    def __reset(self):
        self.__last_response = self.__last_response_model
        self.__error = ""

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
