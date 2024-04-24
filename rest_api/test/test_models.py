"""
April 15 - 2024

Truck - 971.41

Wells - CC -
MP: 354
Balance: 14801.32
Due: 5/8

Wells - Loan -
5/19 - auto pay
871.03

Capital One
Balance : 0

chase
288.51
5/8
Min: 159.07

HD - 0

Sound Visa - 80 - house visa
7977.30
MP: 161
5/9

Sound Checking - 7077.56
Sound Savings - 200.45
Christa - 5538.92
144
5/26



CareCredit
873.62
0
4/17 - auto pay of 175




"""



import datetime

from rest_api.test.models import Categories, Templates, CreditCards, CreditCardData, Institutions, Loans, Services
from rest_api.test.models import ProcessedTransactionBatch, ProcessedTransactionRecords
from rest_api.test.models import SavedFilters
from rest_api.test.models import Tags
from rest_api.test.models import TransactionBatch, TransactionRecords, TransactionColumnTypes, TransactionDataDescription, TransactionBatchContents, TransactionNotes

from rest_api.test.factories.categories import CategoryFactory
from rest_api.test.factories.banks import CreditCardDataFactory, CreditCardsFactory, InstitutionsFactory, LoansFactory, ServicesFactory
from rest_api.test.factories.processed_data import ProcessedTransactionBatchFactory, ProcessedTransactionRecordsFactory
from rest_api.test.factories.tags import TagsFactory
from rest_api.test.factories.templates import TemplatesFactory
from rest_api.test.factories.transactions import TransactionBatchFactory, TransactionColumnTypesFactory, TransactionDataDescriptionFactory, TransactionBatchContentsFactory, TransactionRecordsFactory, TransactionNotesFactory
from rest_api.test.factories.utility import SavedFiltersFactory


class TestCategoryFactory:
    def test_1(self, session):
        CategoryFactory(value="Test Value")
        assert session.query(Categories).count() == 1
        assert session.query(Categories).all()[0].value == "Test Value"


class TestTemplatesFactory:
    def test_2(self, session):
        TemplatesFactory(institution_id=1, hint="Testing Template")
        assert session.query(Templates).count() == 1
        assert session.query(Templates).all()[0].hint == "Testing Template"


class TestBanksFactory:
    def test_credit_cards(self, session):
        CreditCardsFactory(name="Wellsfargo")
        assert session.query(CreditCards).count() == 1

    def test_credit_card_data(self, session):
        CreditCardDataFactory(card_id=3)
        assert session.query(CreditCardData).count() == 1

    def test_institutions(self, session):
        InstitutionsFactory(className="wellsclass")
        assert session.query(Institutions).count() == 1

    def test_loans(self, session):
        LoansFactory(name="Truck")
        assert session.query(Loans).count() == 1

    def test_services(self, session):
        ServicesFactory(name="PSE")
        assert session.query(Services).count() == 1


class TestProcessedData:
    def test_processed_batches(self, session):
        ProcessedTransactionBatchFactory(transaction_batch_id=1)
        assert session.query(ProcessedTransactionBatch).count() == 1

    def test_processed_records(self, session):
        ProcessedTransactionRecordsFactory(processed_batch_id=400, transaction_id=23, institution_id=3)
        assert session.query(ProcessedTransactionRecords).count() == 1


class TestTags:
    def test_tags(self, session):
        TagsFactory()
        assert session.query(Tags).count() == 1


class TestTransactions:
    def test_transaction_batch(self, session):
        TransactionBatchFactory()
        assert session.query(TransactionBatch).count() == 1

    def test_transaction_batch_contents(self, session):
        TransactionBatchContentsFactory(
            institution_id=3,
            batch_id=400,
            file_date=datetime.datetime.now()
        )
        assert session.query(TransactionBatchContents).count() == 1

    def test_transaction_column_data(self, session):
        TransactionColumnTypesFactory(data_type="String")
        assert session.query(TransactionColumnTypes).count() == 1

    def test_transaction_data_definitions(self, session):
        TransactionDataDescriptionFactory(
            id=2,
            institution_id=3,
            column_number=0,
            column_name="description"

        )
        assert session.query(TransactionDataDescription).count() == 1

    def test_transaction_records(self, session):
        TransactionRecordsFactory(
            batch_id=242,
            institution_id=3,
            transaction_date=datetime.datetime.now(),
            transaction_data={}
        )
        assert session.query(TransactionRecords).count() == 1

    def test_transaction_notes(self, session):
        TransactionNotesFactory(transaction_id=39344, note="Note from testing")
        assert session.query(TransactionNotes).count() == 1


class TestUtilityModels:
    def test_saved_filters(self, session):
        SavedFiltersFactory(name='Month End Report')
        assert session.query(SavedFilters).count() == 1
