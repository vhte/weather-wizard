import requests
import untangle

from .interface import AlertsInterface

"""
Canada Public Weather Alerts
"""


class CanadaPublicWeather(AlertsInterface):
    KEY_VARIABLE = "%ID%"
    XML_FEED_MODEL = "https://weather.gc.ca/rss/warning/{}_e.xml".format(KEY_VARIABLE)
    NO_ALERT_MESSAGE = "no watches"

    def __init__(self, id_):
        self._id = id_

        self._url = self.XML_FEED_MODEL.replace(self.KEY_VARIABLE, self._id)

        response = requests.get(self._url)
        if response:
            parse = untangle.parse(response.text)
            self._title = parse.feed.entry.title.cdata
            self._summary = parse.feed.entry.summary.cdata
        else:
            raise Exception("Couldn't retrieve alert data for {}.".format(self._id))

    def has_alert(self):
        # TODO This is not a good option. Should find a correct way to identify if has or not active alert
        if self.NO_ALERT_MESSAGE in self._title.lower():
            return False
        return True

    def get_message(self):
        return self._summary
