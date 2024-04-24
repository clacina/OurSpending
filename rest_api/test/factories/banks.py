from rest_api.test.models import CreditCards, CreditCardData, Institutions, Loans, Services
from rest_api.test.factories.base import BaseFactory


"""
credit_card_data
credit_cards
institutions
loans
services
"""


class CreditCardDataFactory(BaseFactory):
    class Meta:
        abstract = False
        model = CreditCardData


class CreditCardsFactory(BaseFactory):
    class Meta:
        abstract = False
        model = CreditCards


class InstitutionsFactory(BaseFactory):
    class Meta:
        abstract = False
        model = Institutions


class LoansFactory(BaseFactory):
    class Meta:
        abstract = False
        model = Loans


class ServicesFactory(BaseFactory):
    class Meta:
        abstract = False
        model = Services

