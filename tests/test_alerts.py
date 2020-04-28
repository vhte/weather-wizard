import pytest
from alerts.alerts import Alerts

CITY = 6094817  # Ottawa


def test_can_instantiate():
    alert = Alerts(CITY)
