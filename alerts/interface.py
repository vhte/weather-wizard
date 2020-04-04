class AlertsInterface:
    def has_alert(self):
        raise NotImplementedError(
            "This method should be instantiated in children classes."
        )

    def get_message(self):
        raise NotImplementedError(
            "This method should be instantiated in children classes."
        )
