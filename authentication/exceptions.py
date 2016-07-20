import json

from tastypie.exceptions import TastypieError
from tastypie.http import HttpBadRequest


class CustomBadRequest(TastypieError):
    """
    This exception is used to interrupt the flow of processing to immediately
    return a custom HttpResponse.
    """

    def __init__(self, code="", message=""):
        self._response = {
            "error": {"code": code or "not_provided",
                      "message": message or "No error message was provided."}}

    @property
    def response(self):
        return HttpBadRequest(
            json.dumps(self._response),
            content_type='application/json')