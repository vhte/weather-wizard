from openweather import OpenWeatherMap, OpenWeatherException
from neural import NeuralNetwork

try:
    ow = OpenWeatherMap()
except OpenWeatherException as owe:
    print("Unable to get OpenWeather key: " + owe.get_message())
else:
    print(ow.request("forecast", 524901))
    # request.status_code / json()
finally:
    print("--- End of execution --")
