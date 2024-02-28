if "%~1" == "" GOTO NoParam
echo "Updating Batch ID %1"
call python main.py load -f ".\datafiles\2023\Capital One.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\CareCredit.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\Chase.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\HomeDepot.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\Sound Checking Christa.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\Sound Savings.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\Sound Visa.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\Wells Fargo Checking.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\Wells Fargo Visa.csv" -o %1 -n %2
call python main.py load -f ".\datafiles\2023\Sound Visa Christa.csv" -o %1 -n %2
GOTO Exit
:NoParam
echo "No batch id specified"
echo "Usage: "
echo "       load.bat <batch id> <note string>"
:Exit
