from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, Date
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import JSONB

Base = declarative_base()


class Categories(Base):
    __tablename__ = 'categories'

    id = Column(Integer(), nullable=False, primary_key=True)
    value = Column(Text(), nullable=False, unique=True)
    notes = Column(Text())
    is_tax_deductible = Column(Boolean(), server_default='false')


class CreditCardData(Base):
    __tablename__ = 'credit_card_data'

    card_id = Column(Integer(), primary_key=True)
    balance = Column(Float())
    balance_date = Column(Date())
    minimum_payment = Column(Float())
    is_autopay = Column(Boolean(), server_default='false')


class CreditCards(Base):
    __tablename__ = 'credit_cards'

    id = Column(Integer(), nullable=False, primary_key=True)
    name = Column(Text(), nullable=False, unique=True)
    institution_id = Column(Integer())
    interest_rate = Column(Float())
    interest_rate_cash = Column(Float())
    due_date = Column(Integer())
    credit_limit = Column(Float())


class Institutions(Base):
    __tablename__ = 'institutions'

    id = Column(Integer(), nullable=False, primary_key=True)
    key = Column(String())
    name = Column(Text())
    className = Column(Text(), nullable=False)
    notes = Column(Text())


class Loans(Base):
    __tablename__ = 'loans'

    id = Column(Integer(), nullable=False, primary_key=True)
    name = Column(Text(), nullable=False)
    term = Column(Integer())
    term_length = Column(Integer())
    term_rate = Column(Integer())
    balance = Column(Integer())
    payment = Column(Integer())
    due_date = Column(Integer())
    loan_type = Column(Text())
    notes = Column(Text())


class ProcessedTransactionBatch(Base):
    __tablename__ = 'processed_transaction_batch'

    id = Column(Integer(), nullable=False, primary_key=True)
    run_date = Column(DateTime(), nullable=False, server_default='now()')
    notes = Column(Text())
    transaction_batch_id = Column(Integer(), nullable=False)


class ProcessedTransactionRecords(Base):
    __tablename__ = 'processed_transaction_records'

    id = Column(Integer(), nullable=False, primary_key=True)
    processed_batch_id = Column(Integer(), nullable=False)
    transaction_id = Column(Integer(), nullable=False)
    template_id = Column(Integer())
    institution_id = Column(Integer(), nullable=False)


class Qualifiers(Base):
    __tablename__ = 'qualifiers'

    id = Column(Integer(), nullable=False, primary_key=True)
    value = Column(Text(), unique=True)
    institution_id = Column(Integer(), nullable=False, unique=True)


class SavedFilters(Base):
    __tablename__ = 'saved_filters'

    id = Column(Integer(), nullable=False, primary_key=True)
    name = Column(Text(), nullable=False, unique=True)
    created = Column(DateTime(), nullable=False, server_default='now()')
    institutions = Column(Text())
    categories = Column(Text())
    credit = Column(Boolean(), server_default='false')
    tags = Column(Text())
    match_all_tags = Column(Boolean(), server_default='false')
    start_date = Column(Date())
    end_date = Column(Date())
    search_Stringing = Column(Text())


class Services(Base):
    __tablename__ = 'services'

    id = Column(Integer(), nullable=False, primary_key=True)
    name = Column(Text(), nullable=False)
    amount = Column(Integer())
    due_date = Column(Integer())
    notes = Column(Text())
    term_length = Column(Text())


class Tags(Base):
    __tablename__ = 'tags'

    id = Column(Integer(), nullable=False, primary_key=True)
    value = Column(Text(), unique=True)
    notes = Column(Text())
    color = Column(String(10), server_default='#0052CC')


class TemplateQualifiers(Base):
    __tablename__ = 'template_qualifiers'

    template_id = Column(Integer(), nullable=False, unique=True, primary_key=True)
    qualifier_id = Column(Integer(), nullable=False, unique=True, primary_key=True)
    data_column = Column(Text(), unique=True)


class TemplateTags(Base):
    __tablename__ = 'template_tags'

    template_id = Column(Integer(), nullable=False, unique=True, primary_key=True)
    tag_id = Column(Integer(), nullable=False, unique=True, primary_key=True)


class Templates(Base):
    __tablename__ = 'templates'

    id = Column(Integer(), nullable=False, primary_key=True)
    institution_id = Column(Integer(), nullable=False)
    category_id = Column(Integer())
    credit = Column(Boolean(), server_default='false')
    hint = Column(Text(), nullable=False)
    notes = Column(Text())


class TransactionBatch(Base):
    __tablename__ = 'transaction_batch'

    id = Column(Integer(), nullable=False, primary_key=True)
    run_date = Column(DateTime(), nullable=False, server_default='now()')
    notes = Column(Text())


class TransactionBatchContents(Base):
    __tablename__ = 'transaction_batch_contents'

    id = Column(Integer(), nullable=False, primary_key=True)
    filename = Column(Text())
    institution_id = Column(Integer(), nullable=False)
    batch_id = Column(Integer(), nullable=False)
    added_date = Column(DateTime(), nullable=False, server_default='now()')
    file_date = Column(DateTime(), nullable=False)
    transaction_count = Column(Integer(), server_default='0')
    notes = Column(Text())


class TransactionColumnTypes(Base):
    __tablename__ = 'transaction_column_types'

    data_type = Column(String(20), nullable=False, primary_key=True)


class TransactionDataDescription(Base):
    __tablename__ = 'transaction_data_description'

    id = Column(Integer(), nullable=False, primary_key=True)
    institution_id = Column(Integer(), unique=True)
    column_number = Column(Integer(), nullable=False, unique=True)
    column_name = Column(Text(), nullable=False)
    data_id = Column(String(20), server_default='NULL::String', unique=True)
    column_type = Column(String(20))
    is_description = Column(Boolean(), server_default='false')
    is_amount = Column(Boolean(), server_default='false')
    is_transaction_date = Column(Boolean(), server_default='false')


class TransactionNotes(Base):
    __tablename__ = 'transaction_notes'

    id = Column(Integer(), nullable=False, primary_key=True)
    transaction_id = Column(Integer(), nullable=False)
    note = Column(Text())


class TransactionRecords(Base):
    __tablename__ = 'transaction_records'

    id = Column(Integer(), nullable=False, primary_key=True)
    batch_id = Column(Integer(), nullable=False)
    institution_id = Column(Integer(), nullable=False)
    transaction_date = Column(Date(), nullable=False)
    transaction_data = Column(JSONB(), nullable=False)
    description = Column(Text())
    amount = Column(Float(10, 4))
    category_id = Column(Integer())
    is_tax_deductible = Column(Boolean(), server_default='false')


class TransactionTags(Base):
    __tablename__ = 'transaction_tags'

    transaction_id = Column(Integer(), nullable=False, unique=True, primary_key=True)
    tag_id = Column(Integer(), nullable=False, unique=True, primary_key=True)


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer(), nullable=False, primary_key=True)
    username = Column(String(100), nullable=False)
    password = Column(String(100))
