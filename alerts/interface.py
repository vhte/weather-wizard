class AlertsInterface:
    def has_alert(self):
        raise NotImplementedError(
            "This method should be implemented in children classes."
        )

    def get_message(self):
        raise NotImplementedError(
            "This method should be implemented in children classes."
        )
