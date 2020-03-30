from openweather import OpenWeatherMap

"""
This file is dummy model to test outputs from OpenWeather
No test is associated nor this file should be placed on production
"""
ow = OpenWeatherMap()
result = ow.action("weather", 6094817)
print("-- End --")