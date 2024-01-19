import abc

""" ----------------------------  Entry Class Definitions ------------------------"""


class BaseTransaction(metaclass=abc.ABCMeta):
    def __init__(self):
        self.transaction_id = None
        self.date = None
        self.amount = 0.0
        self.description = ""
        self.category = ""
        self.raw = None
        self.institution_id = None
        self.note = None
        self.template_id = None

    def parse_entry(self, data):
        self.raw = data
        self.parse_json(data)

    @abc.abstractmethod
    def normalize_data(self):
        pass

    @abc.abstractmethod
    def parse_json(self, data):
        pass


class CapitalOneTransaction(BaseTransaction):
    def __init__(self):
        super().__init__()
        self.date_posted = None
        self.card_no = None
        self.description = None
        self.category = None
        self.debit = None  # amount
        self.credit = None  # amount

    def parse_json(self, data):
        assert len(data) == 7
        self.date = data[0]
        self.date_posted = data[1]
        self.card_no = data[2]
        self.debit = abs(float(data[5])) if data[5] != '' else None
        self.credit = abs(float(data[6])) if data[6] != '' else None
        self.category = data[4]
        self.description = data[3]

    def normalize_data(self):
        self.amount = self.credit
        if self.debit:
            self.amount = 0.0 - self.debit


class ChaseTransaction(BaseTransaction):
    def __init__(self):
        super().__init__()
        self.post_date = None
        self.description = None
        self.category = None
        self.type = None
        self.amount = None
        self.memo = None

    def parse_json(self, data):
        assert len(data) == 7
        self.raw = data
        self.date = data[0]
        self.post_date = data[1]
        self.description = data[2]
        self.category = data[3]
        self.type = data[4]
        self.amount = float(data[5].strip())
        self.memo = data[6]

    def normalize_data(self):
        """
        Transaction Date,Post Date,     Description,   Category,                    Type,Amount,Memo
        12/27/2023,12/28/2023,          Amazon Prime*1W0D25ML3,Bills & Utilities,   Sale,-153.04,
        12/23/2023,12/24/2023,          AMZN Mktp US*2R4317NT3,Shopping,            Sale,-54.38,
        12/14/2023,12/14/2023,          Payment Thank You - Web,,                   Payment,350.00,
        12/11/2023,12/11/2023,PURCHASE INTEREST CHARGE,Fees & Adjustments,          Fee,-178.41,
        """
        if self.type == 'debit':
            self.amount = 0.0 - self.amount


class HomeDepotTransaction(BaseTransaction):
    def __init__(self):
        super().__init__()
        self.info = None
        self.type = None

    def parse_json(self, data):
        assert len(data) == 4
        self.raw = data
        self.date = data[0].strip()
        self.amount = float(data[1].strip()[1:])
        self.info = data[2].strip()
        self.type = data[3].strip()

    def normalize_data(self):
        self.description = self.type
        # need to swap signs on the amounts
        self.amount = 0.0 - self.amount


class LowesTransaction(BaseTransaction):
    def parse_json(self, data):
        self.raw = data

    def __init__(self):
        super().__init__()

    def normalize_data(self):
        pass


class PayPalCCTransaction(BaseTransaction):
    def __init__(self):
        super().__init__()
        self.date = None
        self.time = None
        self.timeZone = None
        self.name = None
        self.type = None
        self.status = None
        self.currency = None
        self.gross = None
        self.fee = None
        self.net = None
        self.from_Email_Address = None
        self.to_Email_Address = None
        self.transaction_ID = None
        self.item_Title = None
        self.item_ID = None
        self.sales_Tax = None
        self.option_1_Name = None
        self.option_1_Value = None
        self.option_2_Name = None
        self.option_2_Value = None
        self.reference_Txn_ID = None
        self.invoice_Number = None
        self.custom_Number = None
        self.quantity = None
        self.receipt_ID = None
        self.balance = None
        self.subject = None
        self.note = None
        self.balance_Impact = None

    def parse_json(self, data):
        self.raw = data
        self.date = data[0]
        self.time = data[1]
        self.timeZone = data[2]
        self.name = data[3]

        # Update parent class
        self.description = self.name

        self.type = data[4]
        self.status = data[5]
        self.currency = data[6]
        self.gross = float(data[7])
        self.fee = float(data[8])
        self.net = float(data[9])
        self.from_Email_Address = data[10]
        self.to_Email_Address = data[11]
        self.transaction_ID = data[12]
        self.item_Title = data[13]
        self.item_ID = data[14]
        self.sales_Tax = data[15]
        self.option_1_Name = data[16]
        self.option_1_Value = data[17]
        self.option_2_Name = data[18]
        self.option_2_Value = data[19]
        self.reference_Txn_ID = data[20]
        self.invoice_Number = data[21]
        self.custom_Number = data[22]
        self.quantity = data[23]
        self.receipt_ID = data[24]
        self.balance = data[25]
        self.subject = data[26]
        self.note = data[27]
        self.balance_Impact = data[28]

    def normalize_data(self):
        self.amount = self.gross
        if self.description == "":
            self.description = self.subject


class SoundAccountsBaseTransaction(BaseTransaction):
    def __init__(self):
        super().__init__()
        self.transaction_number = None
        self.date = None
        self.description = None
        self.memo = None
        self.amount_debit = None
        self.amount_credit = None
        self.balance = None
        self.check_number = None
        self.fees = None

    """
    Transaction Number,Date,Description,Memo,Amount Debit,Amount Credit,Balance,Check Number,Fees  
    "20231228000000[-8:PST]*1800.00*515**Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111103 CO: SIP US LLC",12/28/2023,"Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111103 CO: SIP US LLC","",,1800.00,"3793.81",,0.00
    "20231219000000[-8:PST]*-128.23*0**Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS",12/19/2023,"Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","",-128.23,,"1993.81",,0.00
    """
    def parse_json(self, data):
        assert len(data) == 9
        self.raw = data
        self.transaction_number = data[0]
        self.date = data[1]
        self.description = data[2]
        self.memo = data[3]
        self.amount_debit = data[4]
        self.amount_credit = data[5]
        self.balance = data[6]
        self.check_number = data[7]
        self.fees = data[8]

    def normalize_data(self):
        self.amount = self.amount_credit
        if self.amount_debit:
            self.amount = self.amount_debit


class CareCreditTransaction(BaseTransaction):
    def __init__(self):
        super().__init__()
        # self.transaction_id = None
        # self.date = None
        # self.amount = 0.0
        # self.description = ""
        # self.category = ""
        # self.raw = None
        # self.institution_id = None
        # self.note = None
        # self.template_id = None
        self.transaction_type = None

    def parse_json(self, data):
        # "Date", "Description", "Original Description", "Amount", "Transaction Type", "Category", "Account Name", "Labels", "Notes"
        # "12/25/2023", "INTEREST CHARGE ON PURCHASES", "INTEREST CHARGE ON PURCHASES", "55.52", "debit", "Finance Charge", "4676", "", ""
        # "12/17/2023", "AUTOMATIC PAYMENT - THANK YOU", "AUTOMATIC PAYMENT - THANK YOU", "175.00", "credit", "Credit Card Payment", "4676", "", ""
        self.raw = data
        self.date = data[0]
        self.description = data[1]
        self.amount = float(data[3])
        self.category = data[5]
        self.transaction_type = data[4]

    def normalize_data(self):
        """
        "Date",     "Description",                  "Original Description",         "Amount",   "Transaction Type","Category","Account Name","Labels","Notes"
        "7/25/2023","INTEREST CHARGE ON PURCHASES", "INTEREST CHARGE ON PURCHASES", "57.62",    "debit","Finance Charge","4676","",""
        "7/17/2023","AUTOMATIC PAYMENT - THANK YOU","AUTOMATIC PAYMENT - THANK YOU","155.00",   "credit","Credit Card Payment","4676","",""
        """
        if self.transaction_type == "debit":
            self.amount = 0.0 - self.amount


class SoundCheckingTransaction(SoundAccountsBaseTransaction):
    def __init__(self):
        super().__init__()

    def parse_json(self, data):
        super().parse_json(data)


class SoundCheckingTransactionChrista(SoundAccountsBaseTransaction):
    def __init__(self):
        super().__init__()

    def parse_json(self, data):
        super().parse_json(data)


class SoundVisaTransaction(SoundAccountsBaseTransaction):
    def __init__(self):
        super().__init__()

    def parse_json(self, data):
        super().parse_json(data)


class WellsCheckingTransaction(BaseTransaction):
    def __init__(self):
        self.action = None
        self.check_number = None
        self.card = None
        super().__init__()

    def parse_json(self, data):
        self.raw = data
        self.date = data[0]
        self.amount = float(data[1])
        self.action = data[2]
        self.check_number = data[3]
        self.description = data[4]
        if "CARD " in self.description:
            ndx = self.description.find('CARD ')
            self.card = self.description[ndx + 5:]

    def normalize_data(self):
        pass


class AmazonTransaction(BaseTransaction):
    def __init__(self):
        self.Website = None
        self.Order_ID = None
        self.Order_Date = None
        self.Purchase_Order_Number = None
        self.Currency = None
        self.Unit_Price = None
        self.Unit_Price_Tax = None
        self.Shipping_Charge = None
        self.Total_Discounts = None
        self.Total_Owed = None
        self.Shipment_Item_Subtotal = None
        self.Shipment_plus_Item_Subtotal_Tax = None
        self.ASIN = None
        self.Product_Condition = None
        self.Quantity = None
        self.Payment_Instrument_Type = None
        self.Order_Status = None
        self.Shipment_Status = None
        self.Ship_Date = None
        self.Shipping_Option = None
        self.Shipping_Address = None
        self.Billing_Address = None
        self.Carrier_Name_and_Tracking_Number = None
        self.Product_Name = None
        self.Gift_Message = None
        self.Gift_Sender_Name = None
        self.Gift_Recipient_Contact_Detail = None

        super().__init__()

    def parse_json(self, data):
        self.raw = data
        self.Website = data[0]
        self.Order_ID = data[1]
        self.Order_Date = data[2]
        self.Purchase_Order_Number = data[3]
        self.Currency = data[4]
        self.Unit_Price = data[5]
        self.Unit_Price_Tax = data[6]
        self.Shipping_Charge = data[7]
        self.Total_Discounts = data[8]
        self.Total_Owed = data[9]
        self.Shipment_Item_Subtotal = data[10]
        self.Shipment_plus_Item_Subtotal_Tax = data[11]
        self.ASIN = data[12]
        self.Product_Condition = data[13]
        self.Quantity = data[14]
        self.Payment_Instrument_Type = data[15]
        self.Order_Status = data[16]
        self.Shipment_Status = data[17]
        self.Ship_Date = data[18]
        self.Shipping_Option = data[19]
        self.Shipping_Address = data[20]
        self.Billing_Address = data[21]
        self.Carrier_Name_and_Tracking_Number = data[22]
        self.Product_Name = data[23]
        self.Gift_Message = data[24]
        self.Gift_Sender_Name = data[25]
        self.Gift_Recipient_Contact_Detail = data[26]

    def normalize_data(self):
        self.description = self.Product_Name
        self.amount = float(self.Total_Owed)
        self.date = self.Order_Date


class AmazonReturnTransaction(BaseTransaction):
    def __init__(self):
        self.OrderID = None
        self.ReversalID = None
        self.RefundCompletionDate = None
        self.Currency = None
        self.AmountRefunded = None
        self.Status = None
        self.DisbursementTyp = None

        super().__init__()

    def parse_json(self, data):
        self.raw = data
        self.OrderID = data[0]
        self.ReversalID = data[1]
        self.RefundCompletionDate = data[2]
        self.Currency = data[3]
        self.AmountRefunded = data[4]
        self.Status = data[5]
        self.DisbursementTyp = data[6]

    def normalize_data(self):
        pass

