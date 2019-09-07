# from weatherwizard import WeatherWizard
from openweather import OpenWeatherMap, OpenWeatherException
from neural import NeuralNetwork

try:
    ow = OpenWeatherMap()
    # 6325494 (Québec)
    print(ow.action("forecast", 6325494))
    # request.status_code / json()
except OpenWeatherException as owe:
    print("Error running OpenWeather: " + owe.get_message())
finally:
    print("--- End of execution --")
