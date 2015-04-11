from django import template
from authentication.utils import abbreviate

register = template.Library()


@register.filter(name='abbreviate')
def abbreviate(value):
    """
    Abbreviates a person's name
    """
    return abbreviate(value)