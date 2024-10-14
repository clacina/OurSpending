from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session


DB_SERVER = "postgresql://lacinaslair@10.0.0.100:5432"


engine = create_engine(f"{DB_SERVER}/")
Session = scoped_session(sessionmaker(engine))
