"""
    processors.py

    Routines to process activity files for various financial institutions.

    Each institution is derived from AccountBase.

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


class ProcessorBase(metaclass=abc.ABCMeta):
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

    def find_banking_template(self, transaction):
        """
        loop through our config.bank_entries and then through each set of qualifiers to see if we have a match
        :param transaction:
        :return: matching template or None if not found
        """
        if "Deposit Home Banking Transfer From Sha" in transaction.description:
            print("Found")
        if "Deposit Home Banking Transfer From Sha" in transaction.category:
            print("Found")

        for be in self.templates:
            found_count = 0
            # match_all should come from template somewhere
            for q in be.qualifiers:
                if q.upper() in transaction.description.upper():
                    found_count += 1
                elif q.upper() in transaction.category.upper():
                    found_count += 1

            if found_count >= len(
                be.qualifiers
            ):  # or (found_count > 0 and match_all is False):
                return be
            # elif found_count > 0:
            #     print(f"Found partial match {found_count} of {len(be.qualifiers)}")

        return None

    def add_spending_transaction(self, template, transaction):
        """
        Update our internal spending dictionary
        :param template: template matched to the transaction
        :param transaction: transaction to include
        :return: None
        """
        if template[0] not in self.spending:
            self.spending[template[0]] = {
                "banking_entity": template,
                "transactions": list(),
            }
        self.spending[template[0]]["transactions"].append(transaction)

    def process_transactions(self, batch_id):
        """
        Loops through the internal list of transactions and adds them to the database using the specified
        batch id.  This is used when loading the original datafiles from the banks
        :return: None
        """
        conn = db_utils.db_access.connect_to_db()
        for transaction in self.transactions:
            transaction.normalize_data()
            transaction.institution_id = self.institution_id
            assert (
                transaction.description and len(transaction.description) > 1
            ), f"Invalid entry {transaction}"
            db_utils.add_transaction(conn, transaction, batch_id)

    def match_templates(self, batch_id: int, processed_batch_id: int):
        """
        This loads the given transaction_batch from the database and then analyzes each
        transaction:
            First it finds a matching template for the transaction
            if successful:
                Updates the Spending Dictionary as well as the
                Category Breakdown Dictionary
            otherwise it adds the transaction to the 'Extras' list
        :param batch_id: batch to process
               processed_batch_id:
        :return: None
        """
        # Load data to process
        raw_data = db_utils.fetch_transactions_from_batch(
            batch_id=batch_id, institution_id=self.institution_id
        )
        self.transactions = self.parse_raw_data(raw_data)

        # Loop through all transactions in the dataset
        for transaction in self.transactions:
            # loop through our templates and qualifiers to find a match
            found_match = self.find_banking_template(transaction=transaction)
            template_id_match = None
            if found_match:
                template_id_match = found_match.id

            db_utils.add_processed_transaction(
                transaction_id=transaction.transaction_id,
                template_id=template_id_match,
                processed_batch_id=processed_batch_id,
                institution_id=self.institution_id,
            )

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
            # logging.info({
            #     "message": "analyze data",
            #     "transaction": transaction
            # })
            """
            (1, 105, 1, 3, datetime.date(2023, 4, 13), ['2023-04-13', '2023-04-13', '7776', 'CAPITAL ONE ONLINE PYMT', 'Payment/Credit', '', '100.00'], None)}            
            """
            if transaction.template_id:
                template = [x for x in self.templates if x[0] == transaction.template_id][0]
                self.add_spending_transaction(template, transaction)
                transaction.template_id = template[0]
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
