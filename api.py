# from weatherwizard import WeatherWizard
from openweather import OpenWeatherMap, OpenWeatherException
from neural import NeuralNetwork

try:
    ow = OpenWeatherMap()
except OpenWeatherException as owe:
    print("Unable to get OpenWeather key: " + owe.get_message())
else:
    # 6325494 (Québec)
    print(ow.action("forecast", 6325494))
    print(ow.get_url())
    # request.status_code / json()
finally:
    print("--- End of execution --")
