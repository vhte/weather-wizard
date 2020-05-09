import pytest
from alerts.alerts import Alerts

CANADA = 6094817  # Ottawa
USA = 4140963  # Washington DC


def test_canada():
    alert = Alerts(CANADA)
    assert isinstance(alert.has_alert(), bool)
    assert isinstance(alert.get_message(), str)


def test_usa():
    alert = Alerts(USA)
    assert isinstance(alert.has_alert(), bool)
    assert isinstance(alert.get_message(), str)
