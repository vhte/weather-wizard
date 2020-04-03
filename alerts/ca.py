import requests
import untangle
import json

from alerts import Alerts

"""
Canada Public Weather Alerts
"""
class CanadaPublicWeather(Alerts):
    KEY_VARIABLE = "%ID%"
    XML_FEED_MODEL = "https://weather.gc.ca/rss/warning/{}_e.xml".format(KEY_VARIABLE)
    NO_ALERT_MESSAGE = "no watches"
    CITIES_DATA = "../cities.json"

    def __init__(self, id):
        super().__init__(id)

        with open(self.CITIES_DATA, "r") as json_file:
            json_data = json.load(json_file)
            city_data = 1

        self._url = self.XML_FEED_MODEL.replace(self.KEY_VARIABLE, self._id)

        response = requests.get(self._url)
        if response:
            parse = untangle.parse(response.text)
            self._title = parse.feed.entry.title.cdata
            self._summary = parse.feed.entry.summary.cdata
        else:
            raise Exception("Couldn't retrieve alert data from {}.".format(self._id))

    def has_alert(self):
        # TODO This is not a good option. Should find a correct way to identify if has or not active alert
        if self.NO_ALERT_MESSAGE in self._title.lower():
            return False
        return True

    def get_message(self):
        return self._summary

alert = CanadaPublicWeather(5969423)
print(alert.has_alert())
print(alert.get_message())