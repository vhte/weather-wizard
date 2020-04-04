from openweather import OpenWeatherMap
from weatherwizard import WeatherWizard
from alerts.alerts import Alerts

"""
This file is dummy model to test outputs from OpenWeather and Public Alerts
No test is associated nor this file should be placed on production
"""
city = 6167865

ow = OpenWeatherMap()
result = ow.action("weather", city)

ww = WeatherWizard(city)
result = ww.weather()

alert = Alerts(5920288)
print(alert.has_alert())
print(alert.get_message())

print("-- End --")
