
from common.db_access import *


def test_db_resource():
    resource_list = []
    resource_list.append(BatchContentsResource(DBAccess().connect_to_db()))
    resource_list.append(CategoryResource(DBAccess().connect_to_db()))
    resource_list.append(CreditCardDataResource(DBAccess().connect_to_db()))
    resource_list.append(CreditCardResource(DBAccess().connect_to_db()))
    resource_list.append(InstitutionResource(DBAccess().connect_to_db()))
    resource_list.append(ProcessedTransactionBatchResource(DBAccess().connect_to_db()))
    resource_list.append(QualifierResource(DBAccess().connect_to_db()))
    resource_list.append(SavedFiltersResource(DBAccess().connect_to_db()))
    resource_list.append(TagsResource(DBAccess().connect_to_db()))
    resource_list.append(TemplateResource(DBAccess().connect_to_db()))
    resource_list.append(TemplateResource(DBAccess().connect_to_db()))
    resource_list.append(TransactionBatchResource(DBAccess().connect_to_db()))
    resource_list.append(TransactionDataDescriptionResource(DBAccess().connect_to_db()))
    resource_list.append(TransactionNotesResource(DBAccess().connect_to_db()))

    for r in resource_list:
        print(r.load_all())
