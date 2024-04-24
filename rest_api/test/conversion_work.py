from omymodels import create_models

ddl_file = 'C:\\Users\\claci\\lacinaslair-2024_03_27_15_29_19-dump.sql'

with open(ddl_file) as infile:
    ddl = infile.read()


result = create_models(ddl, models_type='pydantic')['code']
