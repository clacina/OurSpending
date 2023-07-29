"""
    processors.py

    Routines to process activity files for various financial institutions.

    Each institution is derived from AccountBase.

"""
import abc
# import csv
import processing.db_utils
# import transaction_models as models


class ProcessorBase(metaclass=abc.ABCMeta):
    def __init__(self, datafile: str, config):
        self.name = "Base"
        self.datafile = datafile
        self.transactions = list()
        self.config = config

        # analysis output
        self.unrecognized_transactions = list()
        self.spending = {}
        self.category_breakdown = {}

        if self.datafile:
            self.parse_datafile(self.datafile)

    """ -------------------- Abstract Methods - Must be implemented by derived classes -----------------"""
    @abc.abstractmethod
    def parse_datafile(self, datafile: str):
        """parse from csv"""
        pass

    @abc.abstractmethod
    def parse_raw_data(self, dataset: list):
        """parse from transaction_records"""
        pass

    @abc.abstractmethod
    def parse_processed_data(self, dataset: list):
        """parse from processed_transaction_records"""
        pass

    """ -------------------- Template Matching Algorithm  -----------------"""
    def find_banking_template(self, transaction):
        """
        loop through our config.bank_entries and then through each set of qualifiers to see if we have a match
        :param transaction:
        :return: matching template or None if not found
        """
        if 'Deposit Home Banking Transfer From Sha' in transaction.description:
            print('Found')
        if 'Deposit Home Banking Transfer From Sha' in transaction.category:
            print('Found')

        for be in self.config.templates:
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
        if template.id not in self.spending:
            self.spending[template.id] = {
                "banking_entity": template,
                "transactions": list(),
            }
        self.spending[template.id]["transactions"].append(transaction)

    def update_category_breakdown(self, template, transaction):
        """
        Update our internal category breakdown dictionary
        :param template:
        :param transaction:
        :return: None
        """
        transaction.template_id = template.id

    def process_transactions(self, batch_id):
        """
        Loops through the internal list of transactions and adds them to the database using the specified
        batch id.  This is used when loading the original datafiles from the banks
        :return: None
        """
        conn = processing.db_utils.db_access.connect_to_db()
        for transaction in self.transactions:
            transaction.normalize_data()
            transaction.institution_id = self.config.institution_id
            assert (
                transaction.description and len(transaction.description) > 1
            ), f"Invalid entry {transaction}"
            processing.db_utils.add_transaction(conn, transaction, batch_id)

    def match_templates(self, batch_id: int, processed_batch_id: int):
        """
        This loads the given batch from the database and then analyzes each
        transaction:
            First it finds a matching template for the transaction
            if successful:
                Updates the Spending Dictionary as well as the
                Category Breakdown Dictionary
            otherwise it adds the transaction to the 'Extras' list
        :param batch_id: batch to process
        :return: None
        """
        # Load data to process
        raw_data = processing.db_utils.fetch_transactions_from_batch(batch_id=batch_id,
                                                          institution_id=self.config.institution_id)
        self.transactions = self.parse_raw_data(raw_data)

        # Loop through all transactions in the dataset
        for transaction in self.transactions:
            # loop through our templates and qualifiers to find a match
            found_match = self.find_banking_template(transaction=transaction)
            template_id_match = None
            if found_match:
                template_id_match = found_match.id

            processing.db_utils.add_processed_transaction(transaction_id=transaction.transaction_id,
                                               template_id=template_id_match,
                                               processed_batch_id=processed_batch_id,
                                               institution_id=self.config.institution_id)

    def load_processed_batch(self, processed_batch_id):
        # gives us template_id and transaction_id
        batch_data = processing.db_utils.fetch_processed_transactions_from_batch(processed_batch_id=processed_batch_id,
                                                                      institution_id=self.config.institution_id)
        # Format data for downstream processing
        new_data = []
        for r in batch_data:
            new_data.append(r)

        self.transactions = self.parse_processed_data(new_data)

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

        # Loop through all transactions in the dataset
        for transaction in self.transactions:
            if transaction.template_id:
                template = [x for x in self.config.templates if x.id == transaction.template_id][0]
                self.add_spending_transaction(template, transaction)
                self.update_category_breakdown(template, transaction)
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
