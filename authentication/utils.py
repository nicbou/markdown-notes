#coding: utf-8
#Utility functions for users
#Almost an exact copy of https://gist.github.com/turicas/1428479
import unittest

def abbreviate(name, pretty=False):
    """
    Abbreviates a name, keeping the first name and first letters only
    """
    names = name.split()
    result = [names[0]]
    tiny_name = False
    for surname in names[1:]:
        if len(surname) <= 3:
            result.append(surname)
            tiny_name = True
        else:
            if pretty and tiny_name:
                result.append(surname)
            else:
                result.append(surname[0] + '.')
            tiny_name = False
    return ' '.join(result)

class TestAbbreviate(unittest.TestCase):
    """
    Unit tests for the abbreviate function
    """
    def test_name_and_last_name_should_return_equal(self):
        name = 'Álvaro Justen'
        expected = 'Álvaro J.'
        self.assertEquals(abbreviate(name), expected)
 
    def test_name_with_two_surnames_should_abbreviate_the_middle_one(self):
        name = 'Álvaro Fernandes Justen'
        expected = 'Álvaro F. J.'
        self.assertEquals(abbreviate(name), expected)
 
    def test_three_surnames_should_abbreviate_the_two_in_the_middle(self):
        name = 'Álvaro Fernandes Abreu Justen'
        expected = 'Álvaro F. A. J.'
        self.assertEquals(abbreviate(name), expected)
 
    def test_should_not_abbreviate_tiny_words(self):
        name = 'Álvaro Fernandes de Abreu Justen'
        expected = 'Álvaro F. de A. J.'
        self.assertEquals(abbreviate(name), expected)
        name = 'Fulano da Costa e Silva'
        expected = 'Fulano da C. e S.'
        self.assertEquals(abbreviate(name), expected)
        name = 'Fulano dos Santos'
        expected = 'Fulano dos S.'
        self.assertEquals(abbreviate(name), expected)
 
    def test_should_not_abbreviate_next_surname_if_pretty_is_True(self):
        name = 'Álvaro Fernandes de Abreu Justen'
        expected = 'Álvaro F. de A. J.'
        self.assertEquals(abbreviate(name, pretty=True), expected)
        name = 'Rafael da Costa Rodrigues Silva'
        expected = 'Rafael da Costa R. S.'
        self.assertEquals(abbreviate(name, pretty=True), expected)