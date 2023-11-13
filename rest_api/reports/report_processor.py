"""
report_processor.py

Data and processing routines for report data

"""
import abc
import logging

from rest_api.reports import db_utils


class ProcessingTransaction:
    def __init__(self):
        self.transaction_id = None
        self.template_id = None
        self.institution_id = None
        self.transaction_date = None
        self.transaction_data = None
        self.category_id = None
        self.amount = None
        self.description = None
        self.batch_id = None

    def __repr__(self):
        return f'{self.transaction_id}, {self.template_id}, {self.institution_id}, {self.transaction_date},' \
               f'{self.category_id}, {self.amount}, {self.description}, {self.batch_id}, {self.transaction_data}'

    def parse(self, data):
        #        0    1    2  3             4
        # data: (11, 104, 11, 3, datetime.date(2023, 2, 2),
        #                                        5
        #        ['2023-02-02', '2023-02-03', '7776', 'Amazon web services', 'Other Services', '1.76', ''],
        #        6          7                     8            9
        #        5, Decimal('-1.7600'), 'Amazon web services', 1)
        # logging.info(f"data: {data}")
        self.transaction_id = data[2]
        self.template_id = data[1]
        self.institution_id = data[3]
        self.transaction_date = data[4]
        self.transaction_data = data[5]
        self.category_id = data[6]
        self.amount = data[7]
        self.description = data[8]
        self.batch_id = data[9]


class ReportProcessor(metaclass=abc.ABCMeta):
    def __init__(self, institution_id, templates):
        self.name = "Base"
        self.transactions = list()
        self.templates = templates
        self.institution_id = institution_id

        # analysis output
        self.unrecognized_transactions = list()
        self.spending = {}
        self.category_breakdown = {}

    """ -------------------- Template Matching Algorithm  -----------------"""

    def load_processed_batch(self, processed_batch_id):
        # gives us template_id and transaction_id
        batch_data = db_utils.fetch_processed_transactions_from_batch(
            processed_batch_id=processed_batch_id,
            institution_id=self.institution_id,
        )
        # Format data for downstream processing
        new_data = []
        for r in batch_data:
            pt = ProcessingTransaction()
            pt.parse(r)
            new_data.append(pt)

        self.transactions = new_data

    def analyze_data(self, processed_batch_id=None):
        """
        This loads the given batch from the database and then analyzes each
        transaction:
            if the processed transaction has a template:
                Updates the Spending Dictionary as well as the
                Category Breakdown Dictionary
            otherwise it adds the transaction to the 'Extras' list
        :param processed_batch_id: batch from the processed_transaction_records table to process
        :return: None
        """
        # Load data to process
        if processed_batch_id:
            self.load_processed_batch(processed_batch_id)
        """
        SELECT 
            processed_transaction_records.transaction_id, 
            processed_transaction_records.template_id,
            tr.id,
            tr.institution_id,
            tr.transaction_date,
            tr.transaction_data,
            tr.category_id        
        """

        # Loop through all transactions in the dataset
        recognized_transactions = list()
        for transaction in self.transactions:
            logging.info({
                "message": "analyze data",
                "transaction": transaction
            })
            """
            (1, 105, 1, 3, datetime.date(2023, 4, 13), ['2023-04-13', '2023-04-13', '7776', 'CAPITAL ONE ONLINE PYMT', 'Payment/Credit', '', '100.00'], None)}            
            """
            if transaction.template_id:
                template = [x for x in self.templates if x[0] == transaction.template_id][0]
                transaction.template_id = template[0]
                logging.info({
                    "message": "template",
                    "template": template
                })
                """
         templates: [(7094,                             0  
                      'Cinemark',                       1
                      False,                            2
                      None,                             3
                      2,                                4
                      'Wellsfargo Visa',                5
                      'WLS_VISA',                       6
                      3003,                             7    tag id
                      'Recurring',                      8    tag
                      7094,                             9   template id again
                      3003,                             10   tag id again
                      2005,                             11   category id
                      'Entertainment',                  12   category value
                      5229,                             13   qualifier id
                      'CINEMARK MOVIE CLUB')            14   qualifier value

                              
                'template': (7104, 'Payment', False, None, 3, 'Capital One Visa', 'CONE_VISA', 
                None, None, None, None, 2004, 'Credit Card Payment', 5014, 'CAPITAL ONE ONLINE PYMT')}                
                """

                if transaction.template_id not in self.spending:
                    self.spending[transaction.template_id] = {
                        "banking_entity": template,
                        "transactions": list(),
                    }
                self.spending[transaction.template_id]["transactions"].append(transaction)
            else:
                self.unrecognized_transactions.append(transaction)

        # sort our dictionaries
        myKeys = list(self.spending.keys())
        myKeys.sort()
        sorted_dict = {i: self.spending[i] for i in myKeys}
        self.spending = sorted_dict

        myKeys = list(self.category_breakdown.keys())
        myKeys.sort()
        sorted_dict = {i: self.category_breakdown[i] for i in myKeys}
        self.category_breakdown = sorted_dict

    def calc_spending_item_count(self):
        total_spending_count = 0
        for k, v in self.spending.items():
            total_spending_count += len(v["transactions"])

        return total_spending_count

    def dump(self, verbose=0):
        total_spending_count = self.calc_spending_item_count()
        print(f"{self.name} [{len(self.transactions)}]")
        print(f"Spending--{len(self.spending)} [{total_spending_count}]")

        if verbose & 2:
            for k, v in self.spending.items():
                desc = ", ".join(v["banking_entity"].qualifiers)
                amount = 0.0
                for item in v["transactions"]:
                    amount += item.amount

                print(f"{k}  {len(v['transactions'])} ${amount} {desc}")

        print(f"Extras--{len(self.unrecognized_transactions)}")

        if verbose & 4:
            for e in self.unrecognized_transactions:
                print(f"${e.amount} {e.description} - {e.category}")

        print("----------------------------------------------------------------")

    def dump_by_hint(self):
        for k, v in self.category_breakdown.items():
            print(f"{k}  {len(v['entries'])} ${v['sum']}")
