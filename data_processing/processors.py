"""
Processors for each banking entity
All are derived from base.ProcessorBase and store
transactions derived from transaction_models.BaseTransaction


"""
import csv
import processing.transaction_models as models
import processing.base as base


class CapitalOne(base.ProcessorBase):
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Capital One"

    def parse_datafile(self, datafile):
        """
        Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
        2023-04-13,2023-04-13,7776,CAPITAL ONE ONLINE PYMT,Payment/Credit,,100.00
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            next(csv_reader)  # skip header row
            for row in csv_reader:
                if row:
                    data = models.CapitalOneTransaction()
                    data.parse_entry(row)
                    self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        # transaction_id, institution_id, date time, raw data, notes
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
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Care Credit"

    def parse_datafile(self, datafile):
        """
        "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
        "5/03/2023","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","436.58","debit","Veterinary","4676","",""
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            next(csv_reader)
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
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Chase"

    def parse_datafile(self, datafile):
        """
        Transaction Date,Post Date,Description,Category,Type,Amount,Memo
        05/02/2023,05/03/2023,Kindle Unltd*EL3SL17V3,Shopping,Sale,-11.02,
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
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
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Home Depot"

    def parse_datafile(self, datafile):
        """
        01/12/2023,	$-200.00,	ONLINE PAYMENT        DEERFIELD    IL	,payment
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
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
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Lowes"

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
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "PayPal"

    def parse_datafile(self, datafile):
        """
        "Date","Time","TimeZone","Name","Type","Status","Currency","Gross","Fee","Net","From Email Address","To Email Address","Transaction ID","Item Title","Item ID","Sales Tax","Option 1 Name","Option 1 Value","Option 2 Name","Option 2 Value","Reference Txn ID","Invoice Number","Custom Number","Quantity","Receipt ID","Balance","Subject","Note","Balance Impact"
        "01/03/2023","13:57:10","PST","Uber Technologies, Inc","General Authorization","Pending","USD","-42.92","0.00","-42.92","clacina@mindspring.com","paypal-us@uber.com","91C639911G078574E","","","0.00","","","","","B-34X4798607464050W","2MwMW7bv4u0RhriNV6REgza0","","1","","0.00","","","Memo"
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
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
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Sound Checking"

    def parse_datafile(self, datafile):
        """
        "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
        "Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","1800.00","credit","Transfer","CHECKING CL","",""
        "Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","128.23","debit","Auto Payment","CHECKING CL","",""
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            next(csv_reader)
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


class SoundCheckingChrista(base.ProcessorBase):
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Sound Checking - Christa"

    def parse_datafile(self, datafile):
        """
        "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
        "1/29/2023","Payments Home Banking Transfer From Share 10 TRANSFER","Payments Home Banking Transfer From Share 10 TRANSFER","50.00","credit","Transfer","SELECT VISA","",""
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            next(csv_reader)
            for row in csv_reader:
                data = models.SoundCheckingTransactionChrista()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.SoundCheckingTransactionChrista()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.SoundCheckingTransactionChrista()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class SoundVisa(base.ProcessorBase):
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Sound Visa"

    def parse_datafile(self, datafile):
        """
        "Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
        "1/29/2023","Payments Home Banking Transfer From Share 10 TRANSFER","Payments Home Banking Transfer From Share 10 TRANSFER","50.00","credit","Transfer","SELECT VISA","",""
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
            next(csv_reader)
            for row in csv_reader:
                data = models.SoundVisaTransaction()
                data.parse_entry(row)
                self.transactions.append(data)

    def parse_raw_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.SoundVisaTransaction()
            data.parse_json(row[3])
            data.transaction_id = row[0]
            data.institution_id = row[1]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions

    def parse_processed_data(self, dataset: list):
        raw_transactions = list()
        for row in dataset:
            data = models.SoundVisaTransaction()
            data.parse_json(row[5])
            data.transaction_id = row[0]
            data.template_id = row[1]
            data.institution_id = row[3]
            data.normalize_data()
            raw_transactions.append(data)

        return raw_transactions


class WellsfargoChecking(base.ProcessorBase):
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Wellsfargo Checking"

    def parse_datafile(self, datafile):
        """
        Date, amount, ?, Check number, Description
        "05/01/2023","-75.00","*","","RECURRING TRANSFER TO LACINA C SAVINGS REF #OP0JF9G8XM XXXXXX6385"
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
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
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Wellsfargo Visa"

    def parse_datafile(self, datafile):
        """
        Date, amount, ?, Check number, Description
        "05/01/2023","-75.00","*","","RECURRING TRANSFER TO LACINA C SAVINGS REF #OP0JF9G8XM XXXXXX6385"
        """
        with open(datafile, "rt") as infile:
            csv_reader = csv.reader(infile, delimiter=",")
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
    def __init__(self, datafile: str, config):
        super().__init__(datafile, config)
        self.name = "Amazon Chris"

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
