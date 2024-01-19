"""
Processors for each banking entity
All are derived from base.ProcessorBase and store
transactions derived from transaction_models.BaseTransaction

We need a unique processor for each bank / institution so we can
have the proper Institution name for database lookup.

        self.name = "Base"
        self.datafile = datafile
        self.transactions = list()
        self.config = config

        # analysis output
        self.unrecognized_transactions = list()
        self.spending = {}
        self.category_breakdown = {}

It will also handle the different data formats accordingly using abstract functions.

parse_datafile(datafile)
    Uses CSV reader to read each line in the file and creates the associated object model
    which is used to parse the line data.  The result is a transaction that is added to the collection.

def parse_raw_data(self, dataset: list):
    Used to parse the result of fetch_transactions_from_batch(batch_id, institution_id)
    which are raw transaction_record rows.  Creates a list of model objects

def parse_processed_data(self, dataset: list):
    Used to parse the result of fetch_processed_transactions_from_batch(processed_batch_id, institution_id)
    which is a list of transaction records with the processed batch id appended.
    This replaces the existing transactions for the processor


"""
import csv
import sys

import data_processing.transaction_models as models
import data_processing.base as base
from data_processing import db_utils


class CapitalOne(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.skip_data_rows = 1
        self.name = "Capital One"
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
        Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
        2023-04-13,2023-04-13,7776,CAPITAL ONE ONLINE PYMT,Payment/Credit,,100.00
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            for i in range(0, self.skip_data_rows):
                next(csv_reader)  # skip header row

            for row in csv_reader:
                if row:
                    data = models.CapitalOneTransaction()
                    data.parse_entry(row)
                    self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        # transaction_id, institution_id, date time, raw data
        for row in dataset:
            data = models.CapitalOneTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.CapitalOneTransaction()
            data.parse_json(row[5])
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class CareCredit(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.name = "Care Credit"
        self.skip_data_rows = 1
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
        "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
        "5/03/2023","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","436.58","debit","Veterinary","4676","",""
        "7/25/2023","INTEREST CHARGE ON PURCHASES","INTEREST CHARGE ON PURCHASES","57.62","debit","Finance Charge","4676","",""
        "7/17/2023","AUTOMATIC PAYMENT - THANK YOU","AUTOMATIC PAYMENT - THANK YOU","155.00","credit","Credit Card Payment","4676","",""
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            for i in range(0, self.skip_data_rows):
                next(csv_reader)  # skip header row

            for row in csv_reader:
                data = models.CareCreditTransaction()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.CareCreditTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.CareCreditTransaction()
            data.parse_json(row[5])
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class Chase(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.name = "Chase"
        self.skip_data_rows = 1
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
        Transaction Date,Post Date,Description,Category,Type,Amount,Memo
        05/02/2023,05/03/2023,Kindle Unltd*EL3SL17V3,Shopping,Sale,-11.02,
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            for i in range(0, self.skip_data_rows):
                next(csv_reader)  # skip header row

            for row in csv_reader:
                data = models.ChaseTransaction()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.ChaseTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.ChaseTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class HomeDepot(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.name = "Home Depot"
        self.skip_data_rows = 0
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
        01/12/2023,	$-200.00,	ONLINE PAYMENT        DEERFIELD    IL	,payment
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            for i in range(0, self.skip_data_rows):
                next(csv_reader)  # skip header row

            for row in csv_reader:
                data = models.HomeDepotTransaction()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.HomeDepotTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.HomeDepotTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class Lowes(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.name = "Lowes"
        self.skip_data_rows = 1
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile: str):
        pass

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.LowesTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.LowesTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class PayPal(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.name = "PayPal"
        self.skip_data_rows = 1
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
        "Date","Time","TimeZone","Name","Type","Status","Currency","Gross","Fee","Net","From Email Address","To Email Address","Transaction ID","Item Title","Item ID","Sales Tax","Option 1 Name","Option 1 Value","Option 2 Name","Option 2 Value","Reference Txn ID","Invoice Number","Custom Number","Quantity","Receipt ID","Balance","Subject","Note","Balance Impact"
        "01/03/2023","13:57:10","PST","Uber Technologies, Inc","General Authorization","Pending","USD","-42.92","0.00","-42.92","clacina@mindspring.com","paypal-us@uber.com","91C639911G078574E","","","0.00","","","","","B-34X4798607464050W","2MwMW7bv4u0RhriNV6REgza0","","1","","0.00","","","Memo"
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            for i in range(0, self.skip_data_rows):
                next(csv_reader)  # skip header row

            for row in csv_reader:
                data = models.PayPalCCTransaction()
                data.parse_entry(row)
                if data.status == "Completed" and data.description != "":
                    self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.PayPalCCTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.PayPalCCTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class SoundChecking(base.ProcessorBase):
    def __init__(self, datafile: str, name: str, config=None):
        self.name = name
        self.skip_data_rows = 4
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
        "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
        "Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","1800.00","credit","Transfer","CHECKING CL","",""
        "Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","128.23","debit","Auto Payment","CHECKING CL","",""
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            for i in range(0, self.skip_data_rows):
                next(csv_reader)  # skip header row

            for row in csv_reader:
                data = models.SoundCheckingTransaction()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.SoundCheckingTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.SoundCheckingTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class SoundCheckingHouse(SoundChecking):
    def __init__(self, datafile: str, config=None):
        self.name = "Sound Checking - House"
        super().__init__(datafile, config, self.name)


class SoundCheckingChrista(SoundChecking):
    def __init__(self, datafile: str, config=None):
        self.name = "Sound Checking - Christa"
        super().__init__(datafile, config, self.name)


class SoundVisa(SoundChecking):
    def __init__(self, datafile: str, config=None):
        self.name = "Sound Visa"
        super().__init__(datafile, config, self.name)


class SoundSavings(SoundChecking):
    def __init__(self, datafile: str, config=None):
        self.name = "Sound Savings"
        super().__init__(datafile, config, self.name)


class WellsfargoChecking(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.name = "Wellsfargo Checking"
        self.skip_data_rows = 0
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
        Date, amount, ?, Check number, Description
        "05/01/2023","-75.00","*","","RECURRING TRANSFER TO LACINA C SAVINGS REF #OP0JF9G8XM XXXXXX6385"
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            for i in range(0, self.skip_data_rows):
                next(csv_reader)  # skip header row

            for row in csv_reader:
                data = models.WellsCheckingTransaction()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.WellsCheckingTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.WellsCheckingTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class WellsfargoVisa(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.name = "Wellsfargo Visa"
        self.skip_data_rows = 0
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
        Date, amount, ?, Check number, Description
        "05/01/2023","-75.00","*","","RECURRING TRANSFER TO LACINA C SAVINGS REF #OP0JF9G8XM XXXXXX6385"
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            for i in range(0, self.skip_data_rows):
                next(csv_reader)  # skip header row

            for row in csv_reader:
                data = models.WellsCheckingTransaction()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.WellsCheckingTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.WellsCheckingTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class AmazonRetail(base.ProcessorBase):
    def __init__(self, datafile: str, config=None):
        self.name = "Amazon Chris"
        self.skip_data_rows = 1
        super().__init__(datafile, config, self.name, self.skip_data_rows)

    def parse_datafile(self, datafile):
        """
            "Website","Order ID","Order Date","Purchase Order Number","Currency","Unit Price","Unit Price Tax","Shipping Charge","Total Discounts","Total Owed","Shipment Item Subtotal","Shipment Item Subtotal Tax","ASIN","Product Condition","Quantity","Payment Instrument Type","Order Status","Shipment Status","Ship Date","Shipping Option","Shipping Address","Billing Address","Carrier Name & Tracking Number","Product Name","Gift Message","Gift Sender Name","Gift Recipient Contact Details"
            "Amazon.com","114-3294629-7497007","2023-05-31T13:00:59.799Z","Not Applicable","USD","13.57","0","0","'-0.68'","12.89","Not Available","Not Available","B09LSNJTWF","New","1","Visa - 0094","Authorized","Not Available","Not Available","std-sns-us","Chris J. Lacina 11310 91ST AVENUE CT SW LAKEWOOD WA 98498-3634 United States","Chris J. Lacina 11310 91ST AVENUE CT SW LAKEWOOD WA 98498-3634 United States","Not Available","Blue Diamond, Dark Chocolate Almond Snack Nuts, 40oz Bag","Not Available","Not Available","Not Available"
            "Amazon.com","113-9136495-4375404","2023-05-23T19:14:07Z","Not Applicable","USD","29.97","3","0","0","32.97","29.97","3","B0721DJR91","New","1","Visa - 2652","Closed","Shipped","2023-05-24T01:16:56Z","next-1dc","Chris J. Lacina 11310 91ST AVENUE CT SW LAKEWOOD WA 98498-3634 United States","Chris J. Lacina 3901 N VASSAULT ST TACOMA WA 98407-1130 United States","AMZN_US(TBA306844852264)","ProlinePI new LED 12V Magnetic Towing Tow Light Kit for Trailer RV Dolly Tail Tow Car Boat Truck","Not Available","Not Available","Not Available"
        """
        with open(datafile, "rt", encoding="utf8") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            next(csv_reader)
            for row in csv_reader:
                print(row)
                data = models.AmazonTransaction()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.AmazonTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.AmazonTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


# institution_mapping = {
#     'CAP_VISA': CapitalOne,
#     'AMZN_CHRIS': AmazonRetail,
#     'AMZN_CHRISTA': AmazonRetail,
#     'CC': CareCredit,
#     'CH_VISA': Chase,
#     'HD': HomeDepot,
#     'LWS': Lowes,
#     'PP-Chris': PayPal,
#     'PP-Christa': PayPal,
#     'SND_CHK': SoundCheckingChrista,
#     'SND_CHK_HOUSE': SoundChecking,
#     'SND_VISA': SoundVisa,
#     'WLS_CHK': WellsfargoChecking,
#     'WLS_VISA': WellsfargoVisa
# }

""" When naming / saving bank statements, use a combination of the 'keys' below
- SoundChecking - House - 2023.csv
- Amazon Christa - Jan2024.csv
...
"""


class InstitutionNaming:
    def __init__(self, terms, processor):
        self.processor = processor
        self.terms = terms


institution_file_mapping = [
    InstitutionNaming(['capital'], 'CapitalOne'),
    InstitutionNaming(['care', 'credit'], 'CareCredit'),
    InstitutionNaming(['chase'], 'Chase'),
    InstitutionNaming(['home'], 'HomeDepot'),
    InstitutionNaming(['sound', 'checking', 'house'], 'SoundChecking'),
    InstitutionNaming(['sound', 'checking', 'christa'], 'SoundCheckingChrista'),
    InstitutionNaming(['sound', 'Savings'], 'SoundSavings'),
    InstitutionNaming(['sound', 'visa'], 'SoundVisa'),
    InstitutionNaming(['wells', 'fargo', 'visa'], 'WellsfargoVisa'),
    InstitutionNaming(['wells', 'fargo', 'checking'], 'WellsfargoChecking'),
    InstitutionNaming(['amazon', 'christopher'], 'AmazonRetail'),
    InstitutionNaming(['amazon', 'christa'], 'AmazonRetail'),
    InstitutionNaming(['paypal', 'christopher'], 'PayPal'),
    InstitutionNaming(['paypal', 'christa'], 'PayPal'),
    InstitutionNaming(['lowes'], 'Lowes'),
]


def select_processor_from_file(datafile):
    file_name_check = datafile.lower()

    for m in institution_file_mapping:
        found_phrases = 0
        for phrase in m.terms:
            if phrase.lower() in file_name_check:
                found_phrases += 1

        if found_phrases == len(m.terms):
            return m.processor

    print(f"Unable to determine processor from datafile {datafile}")
    assert 0


def select_processors_from_batch(batch_id):
    processor_list = []
    institutions_list = db_utils.get_institutions_from_batch_contents(batch_id)

    for bank_id in institutions_list:
        processor_class = db_utils.find_class_from_institution(bank_id[0])
        processor_list.append((processor_class, bank_id))

    return processor_list
