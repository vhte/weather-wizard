import requests
from openweather import OpenWeatherMap, OpenWeatherException
from neural import NeuralNetwork

try:
    ow = OpenWeatherMap()
    key = ow.get_key()
except OpenWeatherException as owe:
    print("Unable to get OpenWeather key: " + owe.get_message())
else:
    request = requests.get("http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID=" + key)
    # request.status_code / json()
    print(request.json())