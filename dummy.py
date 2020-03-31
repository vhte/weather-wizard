from openweather import OpenWeatherMap
from weatherwizard import WeatherWizard

"""
This file is dummy model to test outputs from OpenWeather
No test is associated nor this file should be placed on production
"""
city = 6167865

ow = OpenWeatherMap()
result = ow.action("weather", city)

ww = WeatherWizard(city)
result = ww.weather()
print("-- End --")
