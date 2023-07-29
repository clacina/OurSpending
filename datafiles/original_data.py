"""
    entities.py

    Definitions of various entity qualifiers and information.

"""

""" ---- This was the original file used to generate the databse tables. ---- """


"""
categories = [
    "Unknown",
    "Amazon",
    "Cash",
    "Chris's Training / Development"
    "Credit Card Payment",
    "Entertainment",
    "Fast Food/Restaurant",
    "Gas",
    "Goods",
    "Groceries",
    "Hobby",
    "Home Improvement Supplies",
    "Loan",
    "Medical Bill",
    "PayPal Purchase",
    "Pharmacy",
    "Professional Services",
    "Salary",
    "Service",
    "Thrift Store",
    "Transfer",
    "TUV",
    "Vet",
    "Utility"
]

tags = [
    "Recurring",
    "Interest Payment",
    "Concert",
    "Cable Addition",
]
"""


wells_checking_entities = {
    "E-000": {
        "qualifiers": ["CHECK #"],
        "category": "Payment",
        "credit": False,
        "tags": [],
        "hint": "Written Check"
    },
    "E-001": {
        "qualifiers": ["AAA LIFE INS PREM"],
        "category": "Service",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Life Insurance"
    },
    "E-002": {
        "qualifiers": ["ALLEGRO CREDIT"],
        "category": "Loan",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Chris's Hearing Aids"
    },
    "E-003": {
        "qualifiers": ["ATM WITHDRAWAL AUTHORIZED ON"],
        "category": "Cash",
        "credit": False,
        "tags": [],
        "hint": "Cash"
    },
    "E-004": {
        "qualifiers": ["CAPITAL ONE ONLINE PMT"],
        "category": "Credit Card Payment",
        "credit": False,
        "tags": [],
        "hint": "Capital One Credit Card"
    },
    "E-005": {
        "qualifiers": ["CAREPAYMENT PAYMENT"],
        "category": "Credit Card Payment",
        "credit": False,
        "tags": ["Credit Card", ],
        "hint": "Care Credit"
    },
    "E-006": {
        "qualifiers": ["Cash eWithdrawal"],
        "category": "Cash",
        "credit": False,
        "tags": [],
        "hint": "Cash"
    },
    "E-007": {
        "qualifiers": ["CHASE CREDIT CRD EPAY"],
        "category": "Credit Card Payment",
        "credit": False,
        "tags": [],
        "hint": "Chase (Amazon) Credit Card"
    },
    "E-008": {
        "qualifiers": ["City of Tacoma WEB PMTS"],
        "category": "Utility",
        "credit": False,
        "tags": [],
        "hint": "Old Bill"
    },
    "E-009": {
        "qualifiers": ["COMCAST"],
        "category": "Service",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Cable"
    },
    "E-010": {
        "qualifiers": ["HOME DEPOT ONLINE PMT"],
        "category": "Home Improvement Supplies",
        "credit": False,
        "tags": [],
        "hint": "Home Depot"
    },
    "E-011": {
        "qualifiers": ["INTEREST PAYMENT"],
        "category": "Interest",
        "credit": False,
        "tags": ["Interest Payment"],
        "hint": "Interest Payment"
    },
    "E-012": {
        "qualifiers": ["KITSAP CU ECM LOAN PAY"],
        "category": "Loan",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Silverado Loan"
    },
    "E-013": {
        "qualifiers": ["Movement Mtg MTG PYMNT"],
        "category": "Loan",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Mortgage"
    },
    "E-014": {
        "qualifiers": ["ONLINE TRANSFER FROM LACINA C SAVINGS"],
        "category": "Transfer From",
        "credit": True,
        "tags": [],
        "hint": "Pull from Savings"
    },
    "E-015": {
        "qualifiers": ["ONLINE TRANSFER FROM SOUND"],
        "category": "Transfer From",
        "credit": True,
        "tags": [],
        "hint": "Pull from Savings"
    },
    "E-017": {
        "qualifiers": ["ONLINE TRANSFER REF ", " TO INSTALLMENT LOANS XXXXXX49130001"],
        "category": "Loan",
        "credit": False,
        "tags": [],
        "hint": "Loan Payment"
    },
    "E-018": {
        "qualifiers": ["ONLINE TRANSFER REF ", " TO PLATINUM CARD XXXXXXXXXXXX8863"],
        "category": "Credit Card Payment",
        "credit": False,
        "tags": [],
        "hint": "Wells Fargo Credit Card"
    },
    "E-022": {
        "qualifiers": ["ONLINE TRANSFER TO LACINA C SAVINGS"],
        "category": "Transfer To",
        "credit": False,
        "tags": [],
        "hint": "To Savings"
    },
    "E-024": {
        "qualifiers": ["PAYPAL INST XFER", "REPAYME THOUGHT SOFTWARE"],
        "category": "PayPal Purchase",
        "credit": False,
        "tags": [],
        "hint": ""
    },
    "E-108": {
        "qualifiers": ["PAYPAL INST XFER", "THOUGHT SOFTWARE"],
        "category": "PayPal Purchase",
        "credit": False,
        "tags": [],
        "hint": "Paypal"
    },
    "E-025": {
        "qualifiers": ["PROG DIRECT INS INS PREM"],
        "category": "Service",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Progressive"
    },
    "E-026": {
        "qualifiers": ["PUGET SOUND ENER BILLPAY"],
        "category": "Utility",
        "credit": False,
        "tags": [],
        "hint": "PSE"
    },
    "E-029": {
        "qualifiers": [" AUTHORIZED ON ", " Amazon.com*", "CARD 0094"],
        "category": "Amazon",
        "credit": False,
        "tags": [],
        "hint": "Amazon"
    },
    "E-030": {
        "qualifiers": [" AUTHORIZED ON ", " Amazon.com*", "CARD 2552"],
        "category": "Amazon",
        "credit": False,
        "tags": [],
        "hint": "Amazon"
    },
    "E-031": {
        "qualifiers": [" AUTHORIZED ON ", " AMZN Mktp US*", "CARD 0094"],
        "category": "Amazon",
        "credit": False,
        "tags": [],
        "hint": "Amazon"
    },
    "E-032": {
        "qualifiers": [" AUTHORIZED ON ", " AMZN Mktp US*", "CARD 2552"],
        "category": "Amazon",
        "credit": False,
        "tags": [],
        "hint": "Amazon"
    },
    "E-044": {
        "qualifiers": [" AUTHORIZED ON ", " FRANCISCAN HEALTH TACOMA"],
        "category": "Medical Bill",
        "credit": False,
        "tags": [],
        "hint": "Medical Bills"
    },
    "E-045": {
        "qualifiers": [" AUTHORIZED ON ", " FRED M FUEL"],
        "category": "Gas",
        "credit": False,
        "tags": [],
        "hint": "Gas"
    },
    "E-046": {
        "qualifiers": [" AUTHORIZED ON ", " FRED-MEYE"],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Groceries"
    },
    "E-047": {
        "qualifiers": [" AUTHORIZED ON ", " GRUBHUB.COM"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-048": {
        "qualifiers": [" AUTHORIZED ON ", " Kindle Unltd*"],
        "category": "Amazon",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Kindle"
    },
    "E-049": {
        "qualifiers": [" AUTHORIZED ON ", " LAKEWOOD WATER DIS"],
        "category": "Utility",
        "credit": False,
        "tags": [],
        "hint": "Water Bill"
    },
    "E-050": {
        "qualifiers": [" AUTHORIZED ON ", " MCDONALD'S"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-051": {
        "qualifiers": [" AUTHORIZED ON ", " PAYPAL ", "CARD 0094"],
        "category": "PayPal Purchase",
        "credit": False,
        "tags": [],
        "hint": "Paypal"
    },
    "E-052": {
        "qualifiers": [" AUTHORIZED ON ", " PAYPAL ", "CARD 2552"],
        "category": "PayPal Purchase",
        "credit": False,
        "tags": [],
        "hint": "Paypal"
    },
    "E-053": {
        "qualifiers": [" AUTHORIZED ON ", "DOORDASH"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-054": {
        "qualifiers": [" AUTHORIZED ON ", " RITE AID ", "CARD 2552"],
        "category": "Pharmacy",
        "credit": False,
        "tags": [],
        "hint": "Pharmacy"
    },
    "E-055": {
        "qualifiers": [" AUTHORIZED ON ", " RITE AID ", "CARD 0094"],
        "category": "Pharmacy",
        "credit": False,
        "tags": [],
        "hint": "Pharmacy"
    },
    "E-056": {
        "qualifiers": [" AUTHORIZED ON ", " SAFEWAY #", "CARD 2552"],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Groceries"
    },
    "E-057": {
        "qualifiers": [" AUTHORIZED ON ", "ARCO"],
        "category": "Gas",
        "credit": False,
        "tags": ["gas"],
        "hint": "Gas"
    },
    "E-058": {
        "qualifiers": [" AUTHORIZED ON ", " SAFEWAY FUEL", "CARD 0094"],
        "category": "Gas",
        "credit": False,
        "tags": [],
        "hint": "Gas"
    },
    "E-060": {
        "qualifiers": [" AUTHORIZED ON ", " SAFEWAY FUEL", "CARD 2552"],
        "category": "Gas",
        "credit": False,
        "tags": [],
        "hint": "Gas"
    },
    "E-061": {
        "qualifiers": [" AUTHORIZED ON ", " SAFEWAY.COM", " CARD 0094"],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Groceries"
    },
    "E-062": {
        "qualifiers": [" AUTHORIZED ON ", " WENDYS"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-063": {
        "qualifiers": [" AUTHORIZED ON ", " PANERA BREAD"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-064": {
        "qualifiers": [" AUTHORIZED ON ", " PAPA MURPHY"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-065": {
        "qualifiers": [" AUTHORIZED ON ", " DEL TACO"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-066": {
        "qualifiers": [" AUTHORIZED ON ", " STARBUCKS"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-067": {
        "qualifiers": [" AUTHORIZED ON ", " BEST BURGERS"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-068": {
        "qualifiers": [" AUTHORIZED ON ", " TOP POT"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-069": {
        "qualifiers": [" AUTHORIZED ON ", " SAFEWAY #", "CARD 0094"],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Groceries"
    },
    "E-070": {
        "qualifiers": [" WITH CASH BACK", " CARD 2552"],
        "category": "Cash",
        "credit": False,
        "tags": [],
        "hint": "Cash +"
    },
    "E-075": {
        "qualifiers": ["RECURRING PAYMENT AUTHORIZED ON ", " CRICUT "],
        "category": "Hobby",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Cricut"
    },
    "E-077": {
        "qualifiers": ["RECURRING PAYMENT AUTHORIZED ON ", " GODADDY.COM"],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Web Domains"
    },
    "E-078": {
        "qualifiers": ["RECURRING PAYMENT AUTHORIZED ON ", " EARTHLINK"],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Chris's Email"
    },

    "E-080": {
        "qualifiers": [" AUTHORIZED ON ", " GOODWILL"],
        "category": "Thrift Store",
        "credit": False,
        "tags": [],
        "hint": "Thrift Store"
    },
    "E-081": {
        "qualifiers": [" AUTHORIZED ON ", " LIFE CENTER THRIFT"],
        "category": "Thrift Store",
        "credit": False,
        "tags": [],
        "hint": "Thrift Store"
    },
    "E-082": {
        "qualifiers": [" AUTHORIZED ON ", " GOODW"],
        "category": "Thrift Store",
        "credit": False,
        "tags": [],
        "hint": "Thrift Store"
    },
    "E-083": {
        "qualifiers": [" AUTHORIZED ON ", " MISSION THRIFT"],
        "category": "Thrift Store",
        "credit": False,
        "tags": [],
        "hint": "Thrift Store"
    },
    "E-090": {
        "qualifiers": ["RECURRING PAYMENT AUTHORIZED ON ", " FRED MEYER", " CARD 0094"],
        "category": "Groceries",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Groceries"
    },
    "E-095": {
        "qualifiers": ["RECURRING PAYMENT AUTHORIZED ON ", " MICROSOFT*SUBSCRIP"],
        "category": "Entertainment",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Microsoft Recurring"
    },
    "E-096": {
        "qualifiers": ["RECURRING PAYMENT AUTHORIZED ON ", " Microsoft*Xbox Liv "],
        "category": "Entertainment",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Microsoft Recurring"
    },
    "E-100": {
        "qualifiers": ["RECURRING TRANSFER TO LACINA C SAVINGS"],
        "category": "Transfer To",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Auto Transfer to Savings"
    },
    "E-101": {
        "qualifiers": ["SIP US LLC DIRECT DEP"],
        "category": "Salary",
        "credit": True,
        "tags": [],
        "hint": "Salary"
    },
    "E-102": {
        "qualifiers": ["SYNCHRONY BANK PAYMENT"],
        "category": "Credit Card Payment",
        "credit": False,
        "tags": [],
        "hint": ""
    },
    "E-103": {
        "qualifiers": ["TEN DIGITAL PTE. IAT PAYPAL"],
        "category": "Goods",
        "credit": False,
        "tags": [],
        "hint": ""
    },
    "E-104": {
        "qualifiers": ["TRANSFER TO WIEBE PAUL ON"],
        "category": "Rent",
        "credit": False,
        "tags": [],
        "hint": "Rent"
    },
    "E-105": {
        "qualifiers": ["UNITY TECHNOLOGI IAT PAYPAL"],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": [],
        "hint": "Chris's Mobile Dev"
    },
    "E-106": {
        "qualifiers": ["VENMO PAYMENT"],
        "category": "Cash",
        "credit": False,
        "tags": [],
        "hint": "Venmo Payment"
    },
    "E-107": {
        "qualifiers": ["VERIZON WIRELESS PAYMENTS"],
        "category": "Service",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Cell Phones"
    },
    "E-109": {
        "qualifiers": [" AUTHORIZED ON ", "HOME DEPOT"],
        "category": "Home Improvement Supplies",
        "credit": False,
        "tags": [],
        "hint": "Home Depot"
    },
    "E-110": {
        "qualifiers": [" AUTHORIZED ON ", "WALGREENS"],
        "category": "Pharmacy",
        "credit": False,
        "tags": [],
        "hint": "Pharmacy"
    },
    "E-111": {
        "qualifiers": [" AUTHORIZED ON ", " KRISPY KREME"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-112": {
        "qualifiers": [" AUTHORIZED ON ", " TRADER JOE"],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Groceries"
    },
    "E-113": {
        "qualifiers": [" AUTHORIZED ON ", " TACO BELL"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-114": {
        "qualifiers": [" AUTHORIZED ON ", " SUBWAY"],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "E-120": {
        "qualifiers": [" AUTHORIZED ON ", "TACOMA SOLID WASTE"],
        "category": "Service",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Dump Run"
    },
    "E-121": {
        "qualifiers": [" AUTHORIZED ON ", "ALANMACKSDENTISTRY"],
        "category": "Medical Bill",
        "credit": False,
        "tags": [],
        "hint": "Dentist"
    },
    "E-122": {
        "qualifiers": [" AUTHORIZED ON ", "WALMARTPETRX"],
        "category": "Pharmacy",
        "credit": False,
        "tags": [],
        "hint": "Nolia Insulin"
    },
    "E-123": {
        "qualifiers": ["RECURRING PAYMENT AUTHORIZED ON", "ZOOM"],
        "category": "Hobby",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Zoom"
    },
    "E-124": {
        "qualifiers": [" AUTHORIZED ON ", " SOUNDVIEW VET"],
        "category": "Vet",
        "credit": False,
        "tags": [],
        "hint": "Vet"
    },
    "E-125": {
        "qualifiers": ["RECURRING PAYMENT AUTHORIZED ON", "GODADDY"],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Chris's Training / Development"
    },
    "E-126": {
        "qualifiers": [" AUTHORIZED ON ", " AAA "],
        "category": "Service",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "AAA"
    },
    "E-130": {
        "qualifiers": [" RECURRING PAYMENT AUTHORIZED  "],
        "category": "Payment",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Other Recurring Payments"
    },
    "E-131": {
        "qualifiers": [" UPS STORE"],
        "category": "",
        "credit": False,
        "tags": [],
        "hint": "UPS Store"
    },
    "E-132": {
        "qualifiers": [" U-HAUL "],
        "category": "",
        "credit": False,
        "tags": [],
        "hint": "U-Haul"
    },
    "E-133": {
        "qualifiers": ["evernote"],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Chris Software"
    },
    "E-134": {
        "qualifiers": ["paddle.com"],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["recurring"],
        "hint": "Chris Software"
    },
    "E-135": {
        "qualifiers": ["RETURN AUTHORIZED ON", "BIG LOTS"],
        "credit": True,
        "category": "Return",
        "tags": {},
        "hint": "Big Lots Return"
    },
}

wells_visa_entities = {
    "C-200": {
        "qualifiers": ["APPLE.COM/BILL"],
        "category": "iPhone",
        "credit": False,
        "tags": [],
        "hint": "Apple.com"
    },
    "C-201": {
        "qualifiers": ["CINEMARK MOVIE CLUB"],
        "category": "Entertainment",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Cinemark"
    },
    "C-202": {
        "qualifiers": ["Disney Plus"],
        "category": "Entertainment",
        "credit": False,
        "tags": ["Recurring", "Cable Addition"],
        "hint": "Disney Plus"
    },
    "C-202a": {
        "qualifiers": ["DisneyPLUS"],
        "category": "Entertainment",
        "credit": False,
        "tags": ["Recurring", "Cable Addition"],
        "hint": "Disney Plus"
    },
    "C-203": {
        "qualifiers": ["DRIFTGOODS"],
        "category": "Goods",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Chris's Truck"
    },
    "C-204": {
        "qualifiers": ["HOSTWINDS"],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["Recurring", ],
        "hint": "Web Hosting"
    },
    "C-205": {
        "qualifiers": ["INTEREST CHARGE ON PURCHASES"],
        "category": "Interest",
        "credit": False,
        "tags": [],
        "hint": "Interest Charges"
    },
    "C-206": {
        "qualifiers": ["ONLINE PAYMENT THANK YOU"],
        "category": "Payment",
        "credit": False,
        "tags": [],
        "hint": "Payments"
    },
    "C-207": {
        "qualifiers": ["OPTUMRX"],
        "category": "Pharmacy",
        "credit": False,
        "tags": [],
        "hint": "Optum RX"
    },
    "C-208": {
        "qualifiers": ["SAFEBYTES"],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["recurring"],
        "hint": "Safebytes"
    },
}

"""  Capital One
CAPITAL ONE ONLINE PYMT,Payment/Credit,,100.00
INTEREST CHARGE:PURCHASES,Fee/Interest Charge,11.29,
Amazon web services,Other Services,1.76,
CAPITAL ONE ONLINE PYMT,Payment/Credit,,50.00
INTEREST CHARGE:PURCHASES,Fee/Interest Charge,1.41,
Amazon web services,Other Services,1.76,
TM *PNK TRUSTFALL TOUR,Entertainment,381.82,
U-HAUL-CTR-12TH-L #70221,Car Rental,99.10,
CAPITAL ONE ONLINE PYMT,Payment/Credit,,152.84
INTEREST CHARGE:PURCHASES,Fee/Interest Charge,3.77,
Amazon web services,Other Services,1.76,
CAPITAL ONE ONLINE PYMT,Payment/Credit,,200.00
ROUND TABLE PIZZA 821,Dining,32.75,
Amazon web services,Other Services,1.76,
CT LOCKSMITH,Professional Services,312.80,
"""

capitalone_entities = {
    "CONE-000": {
        "qualifiers": ["Amazon web services", ],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Chris's Web Work"
    },
    "CONE-001": {
        "qualifiers": ["CAPITAL ONE ONLINE PYMT", ],
        "category": "Credit Card Payment",
        "credit": False,
        "tags": [],
        "hint": "Payment"
    },
    "CONE-002": {
        "qualifiers": ["INTEREST CHARGE:PURCHASES", ],
        "category": "Interest",
        "credit": False,
        "tags": [],
        "hint": "Fines"
    },
    "CONE-003": {
        "qualifiers": ["ROUND TABLE PIZZA", ],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    # Category vs Specific Business
    "CONE-101": {
        "qualifiers": ["Other Services", ],
        "category": "Professional Services",
        "credit": False,
        "tags": [],
        "hint": "Other Services",
        "check_category": True
    },
    "CONE-102": {
        "qualifiers": ["Payment/Credit", ],
        "category": "Credit Card Payment",
        "credit": False,
        "tags": [],
        "hint": "Credit",
        "check_category": True
    },
    "CONE-103": {
        "qualifiers": ["Professional Services", ],
        "category": "Professional Services",
        "credit": False,
        "tags": [],
        "hint": "Professional Services",
        "check_category": True
    },
    "CONE-104": {
        "qualifiers": ["Dining", ],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Dining",
        "check_category": True
    },
    "CONE-105": {
        "qualifiers": ["Entertainment", ],
        "category": "Entertainment",
        "credit": False,
        "tags": [],
        "hint": "Entertainment",
        "check_category": True
    },
    "CONE-106": {
        "qualifiers": ["Car Rental", ],
        "category": "",
        "credit": False,
        "tags": [],
        "hint": "Car Rental"
    }
}

"""  Chase
Alexa Skills*HM6350Z30,Shopping,Sale,-0.88,
Amazon Music*HC9NF1MW0,Shopping,Sale,-17.64,
Amazon.com*6P0ES20T3,Shopping,Sale,-23.56,
AMZN Mktp US*2T0J28W63,Shopping,Sale,-18.94,
Kindle Unltd*PB9C96YR3,Shopping,Sale,-11.02,
Payment Thank You - Web,,Payment,296.31,
PP *WWGOA.com Purchase,Bills & Utilities,Sale,-79.42,
PURCHASE INTEREST CHARGE,Fees & Adjustments,Fee,-165.72,
WF WAYFAIR3568935856,Home,Sale,-579.03,
WF WAYFAIR3869788846,Home,Sale,-176.47,
"""

chase_entities = {
    "CH-000": {
        "qualifiers": ["Alexa Skills", ],
        "category": "Amazon",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Alexa Skill"
    },
    "CH-001": {
        "qualifiers": ["Amazon Music", ],
        "category": "Amazon",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Amazon Music"
    },
    "CH-002": {
        "qualifiers": ["Amazon.com", ],
        "category": "Amazon",
        "credit": False,
        "tags": [],
        "hint": "Amazon"
    },
    "CH-003": {
        "qualifiers": ["AMZN Mktp", ],
        "category": "Amazon",
        "credit": False,
        "tags": [],
        "hint": "Amazon"
    },
    "CH-004": {
        "qualifiers": ["Kindle Unltd", ],
        "category": "Amazon",
        "credit": False,
        "tags": [],
        "hint": "Kindle"
    },
    "CH-100": {
        "qualifiers": ["WAYFAIR", ],
        "category": "Goods",
        "credit": False,
        "tags": [],
        "hint": "Wayfair"
    },
    "CH-102": {
        "qualifiers": ["Shopping", ],
        "category": "Goods",
        "credit": False,
        "tags": [],
        "hint": ""
    },
    "CH-103": {
        "qualifiers": ["Payment", ],
        "category": "Payment",
        "credit": False,
        "tags": [],
        "hint": ""
    },
    "CH-104": {
        "qualifiers": ["Bills & Utilities", ],
        "category": "Utilities",
        "credit": False,
        "tags": [],
        "hint": ""
    },
    "CH-105": {
        "qualifiers": ["Fees & Adjustments", ],
        "category": "Interest",
        "credit": False,
        "tags": [],
        "hint": ""
    }
}

"""  Home Depot
HOME DEPOT.COM           800-430-3376 US	,purchase
INTEREST CHARGE ON CASH ADVANCES	,interest charged
INTEREST CHARGE ON PURCHASES	,interest charged
ONLINE PAYMENT           DEERFIELD    IL	,payment
THE HOME DEPOT           TACOMA       WA	,purchase
THE HOME DEPOT           TACOMA       WA	,return
"""

homedepot_entities = {
    "HD-001": {
        "qualifiers": ["purchase", ],
        "category": "Home Improvement Supplies",
        "credit": False,
        "tags": [],
        "hint": "Purchase"
    },
    "HD-002": {
        "qualifiers": ["interest charged", ],
        "category": "Interest",
        "credit": False,
        "tags": [],
        "hint": "Interest Charged"
    },
    "HD-003": {
        "qualifiers": ["payment", ],
        "category": "Payment",
        "credit": False,
        "tags": [],
        "hint": "Payment"
    },
    "HD-004": {
        "qualifiers": ["return", ],
        "category": "Return",
        "credit": False,
        "tags": [],
        "hint": "Return"
    },

}

"""  Paypal
"","PayPal Buyer Credit Payment Funding","Completed","USD","535.85","0.00","535.85","","clacina@mindspring.com","7VG4062211773435L","TM *TICKETMASTER","","0.00","","","","","2VS66822LB780634W","SEA/58-21178","","1","","0.00","TM *TICKETMASTER","","Credit"

"1&1 IONOS Inc.","PreApproved Payment Bill User Payment","Completed","USD","-55.00","0.00","-55.00","clacina@mindspring.com","paypal@1and1.com","0D990021A9557054P","K651887266/005299058323","","0.00","","","","","B-6UV73398DV573131S","K651887266/005299058323","","1","","-55.00","K651887266/005299058323","","Debit"
"ALIPAY US, INC.","Express Checkout Payment","Completed","USD","-52.03","0.00","-52.03","clacina@mindspring.com","AE-AlipayUSPaypal@service.alibaba.com","6GA85845XM4928444","185W Led Garage Light with Plug 18000LM Lamp Adjustable Deformable Bulb Ceiling Light for Storage/Warehouse Workshop Lighting","8162446564099513","0.00","","","","","","2023021481031300001068840124456","AE_US_USD","1","","-52.03","12990501203230214066396859513","","Debit"
"eBay Commerce Inc.","Express Checkout Payment","Completed","USD","-60.50","0.00","-60.50","clacina@mindspring.com","ECI_USD_PPFOP@ebay.com","4EH87335VF552131B","Purchase amount","","0.00","","","","","76H4199484604122H","v2_1a061bd2-95c1-42b0-91e0-e38c83598a33_2_16","100022629173532","1","","-60.50","Purchase amount","Order Number : 06-09822-57083","Debit"
"eBay Commerce Inc.","General Authorization","Completed","USD","-60.50","0.00","-60.50","clacina@mindspring.com","ECI_USD_PPFOP@ebay.com","76H4199484604122H","Purchase amount","","0.00","","","","","","1d8d9237-fe3b-4b2d-b94d-bf67b99d37da","100022629173532","1","","0.00","Purchase amount","","Memo"
"FastSpring","Express Checkout Payment","Completed","USD","-17.65","0.00","-17.65","clacina@mindspring.com","pporders@fastspring.com","905264290D364554D","Bartender 4","","0.00","","","","","2Y145435TR9266404","","","1","","-17.65","Bartender 4","","Debit"
"FastSpring","General Authorization","Completed","USD","-17.65","0.00","-17.65","clacina@mindspring.com","pporders@fastspring.com","2Y145435TR9266404","Bartender 4","","0.00","","","","","","","","1","","0.00","Bartender 4","","Memo"
"GameDevHQ, Inc.","Subscription Payment","Completed","USD","-99.00","0.00","-99.00","clacina@mindspring.com","subscriptions@gamedevhq.com","13286162MP432200N","PRO YEARLY at GameDevHQ","","0.00","","","","","I-6BRC4PXDNRLF","","","1","","-99.00","PRO YEARLY at GameDevHQ","","Debit"
"Hostwinds","PreApproved Payment Bill User Payment","Completed","USD","-0.92","0.00","-0.92","clacina@mindspring.com","payments@hostwinds.com","4NV70542RR4320252","","","0.00","","","","","B-48P190783J1010028","3095802","","1","","-0.92","","","Debit"
"PayPal Cashback Mastercard","General Payment","Completed","USD","-100.00","0.00","-100.00","clacina@mindspring.com","","0HP52282TM3171009","","","","","","","","","","","","","-100.00","","","Debit"
"PayPal Cashback Mastercard","General Payment","Completed","USD","-200.00","0.00","-200.00","clacina@mindspring.com","","21312611H8192622R","","","","","","","","","","","","","-200.00","","","Debit"
"PayPal Cashback Mastercard","General Payment","Completed","USD","-200.00","0.00","-200.00","clacina@mindspring.com","","0FG14778499170619","","","","","","","","","","","","","-200.00","","","Debit"
"Sew Essential","Subscription Payment","Completed","USD","-12.75","0.00","-12.75","clacina@mindspring.com","silk@sew-essential.com","2M9433488C910735C","Yearly Subscription","","0.00","","","","","I-HV28W1M7JRNA","","","1","","-12.75","Yearly Subscription","","Debit"
"SQ *GO PHILLY LAKEWOOD","General Authorization","Completed","USD","-20.00","0.00","-20.00","clacina@mindspring.com","","36E9977667744192B","","","","","","","","","","","","","0.00","","","Memo"
"SQ *GO PHILLY LAKEWOOD","Website Payment","Completed","USD","-20.00","0.00","-20.00","clacina@mindspring.com","","57766387N8170803C","","","","","","","","36E9977667744192B","","","","","-20.00","","","Debit"
"Ten Digital Pte. Ltd.","Express Checkout Payment","Completed","USD","-57.96","0.00","-57.96","clacina@mindspring.com","paypal@tendc.co","9ML149244L088130E","Octopus - Wooden Jigsaw Puzzle - A3/Big, Mother Earth - Wooden Jigsaw Puzzle - A3/Big, Elephant - Wooden Jigsaw Puzzle - A3/Big, Rainbow Lion - Wooden Jigsaw Puzzle - A3/Big","","0.00","","","","","","c26423865540814.1","Shopify","4","","-57.96","Octopus - Wooden Jigsaw Puzzle - A3/BigMother Earth - Wooden Jigsaw Puzzle - A3/BigElephant - Wooden Jigsaw Puzzle - A3/BigRainbow Lion - Wooden Jigsaw Puzzle - A3/Big","","Debit"
"Ticketmaster, LLC","Express Checkout Payment","Completed","USD","-535.85","0.00","-535.85","clacina@mindspring.com","TMpaypal001@ticketmaster.com","2VS66822LB780634W","TM *TICKETMASTER","","0.00","","","","","","SEA/58-21178","","1","","-535.85","TM *TICKETMASTER","","Debit"
"Valve Corp.","PreApproved Payment Bill User Payment","Completed","USD","-33.08","0.00","-33.08","clacina@mindspring.com","steamgames@steampowered.com","88599215WN3823415","","","0.00","","","","","B-6M848057S0390314W","3600104981461362454","","1","","-33.08","","","Debit"

"""

paypal_entities = {
    "PP-001": {
        "qualifiers": ["eBay Commerce Inc", ],
        "category": "Goods",
        "credit": False,
        "tags": [],
        "hint": "EBay"
    },
    "PP-002": {
        "qualifiers": ["UNITY TECHNOLOGIES", ],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": [],
        "hint": "Chris's Web Stuff"
    },
    "PP-003": {
        "qualifiers": ["Udemy", ],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": [],
        "hint": "Training"
    },
    "PP-004": {
        "qualifiers": ["Uber Technologies", ],
        "category": "",
        "credit": False,
        "tags": [],
        "hint": "Uber"
    },
    "PP-005": {
        "qualifiers": ["Uber Eats", ],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "PP-006": {
        "qualifiers": ["General Payment", ],
        "category": "Payment",
        "credit": False,
        "tags": [],
        "hint": "Payment"
    },
    "PP-007": {
        "qualifiers": ["Ticketmaster", ],
        "category": "Entertainment",
        "credit": False,
        "tags": [],
        "hint": "Entertainment"
    },
    "PP-008": {
        "qualifiers": ["IONOS Inc", ],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": [],
        "hint": "Web Domains"
    },
    "PP-009": {
        "qualifiers": ["GameDevHQ", ],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": ["Recurring"],
        "hint": "Chris's web work"
    },
    "PP-010": {
        "qualifiers": ["Hostwinds", ],
        "category": "Chris's Training / Development",
        "credit": False,
        "tags": [],
        "hint": "Chris's web work"
    },
}

lowes_entities = {

}


"""  Care Credit Entities
"Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
"5/03/2023","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","SOUNDVIEW VETERINARY HOSPTACOMA WA. DEFERRED/NO INT IF PD IN FULL 6080","436.58","debit","Veterinary","4676","",""
"4/24/2023","INTEREST CHARGE ON PURCHASES","INTEREST CHARGE ON PURCHASES","378.86","debit","Finance Charge","4676","",""
"4/17/2023","AUTOMATIC PAYMENT - THANK YOU","AUTOMATIC PAYMENT - THANK YOU","175.00","credit","Credit Card Payment","4676","",""
"3/24/2023","INTEREST CHARGE ON PURCHASES","INTEREST CHARGE ON PURCHASES","34.76","debit","Finance Charge","4676","",""
"""


carecredit_entities = {
    "CC-001": {
        "qualifiers": ["SOUNDVIEW VETERINARY HOSPTA", ],
        "category": "Vet",
        "credit": False,
        "tags": [],
        "hint": "Vet"
    },
    "CC-002": {
        "qualifiers": ["INTEREST CHARGE ON ", ],
        "category": "Interest",
        "credit": False,
        "tags": [],
        "hint": "Interest"
    },
    "CC-003": {
        "qualifiers": ["AUTOMATIC PAYMEN", ],
        "category": "Payment",
        "credit": False,
        "tags": [],
        "hint": "Payment"
    },
}


"""  Sound Checking 
"Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
"DEP PRENOTIFICATION FROM SIP US LLC DEP PRENOTIFICATION FROM SIP US LLC","DEP PRENOTIFICATION FROM SIP US LLC DEP PRENOTIFICATION FROM SIP US LLC","0.00","credit","Investments","CHECKING CL","",""
"Deposit ACH IRS TREAS 310 TYPE: TAX REF ID: 9111036170 CO: IRS TREAS 310","Deposit ACH IRS TREAS 310 TYPE: TAX REF ID: 9111036170 CO: IRS TREAS 310","795.00","credit","Federal Tax","CHECKING CL","",""
"Deposit ACH LIGHTSTREAM TYPE: LOAN FUNDS ID: 1253108793 CO: LIGHTSTREAM","Deposit ACH LIGHTSTREAM TYPE: LOAN FUNDS ID: 1253108793 CO: LIGHTSTREAM","5000.00","credit","Transfer","CHECKING CL","",""
"Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","1800.00","credit","Transfer","CHECKING CL","",""
"Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","1800.00","credit","Transfer","CHECKING CL","",""
"Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","Deposit ACH SIP US LLC TYPE: DIRECT DEP ID: 9111111101 CO: SIP US LLC","1800.00","credit","Transfer","CHECKING CL","",""
"Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","128.23","debit","Auto Payment","CHECKING CL","",""
"Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","Withdrawal ACH LIGHTSTREAM TYPE: LOAN PMTS ID: 1253108792 CO: LIGHTSTREAM NAME: LACINA, CHRIS","128.23","debit","Auto Payment","CHECKING CL","",""
"Withdrawal ACH MOVEMENT MTG PMT TYPE: MTGE PAYMT ID: 4823070213 CO: MOVEMENT MTG PMT NAME: CHRIS LACINA","Withdrawal ACH MOVEMENT MTG PMT TYPE: MTGE PAYMT ID: 4823070213 CO: MOVEMENT MTG PMT NAME: CHRIS LACINA","3358.49","debit","Mortgage & Rent","CHECKING CL","",""
"Withdrawal ACH PAYPAL TYPE: INST XFER ID: PAYPALSI77 CO: PAYPAL NAME: CHRISTA SMILEY","Withdrawal ACH PAYPAL TYPE: INST XFER ID: PAYPALSI77 CO: PAYPAL NAME: CHRISTA SMILEY","17.09","debit","Shopping","CHECKING CL","",""
"Withdrawal Debit Card Check Card BEACON PLUMBING KENT WA","Withdrawal Debit Card Check Card BEACON PLUMBING KENT WA","955.35","debit","Home Improvement","CHECKING CL","",""
"Withdrawal Debit Card Check Card ISSAQUAH PEST & HOM... 188-87211115 OR","Withdrawal Debit Card Check Card ISSAQUAH PEST & HOM... 188-87211115 OR","4767.72","debit","Home Improvement","CHECKING CL","",""
"Withdrawal Debit Card Check Card MEMO'S MEXICAN REST LAKEWOOD WA","Withdrawal Debit Card Check Card MEMO'S MEXICAN REST LAKEWOOD WA","11.56","debit","Restaurants","CHECKING CL","",""
"Withdrawal Debit Card Check Card U-HAUL OF LAKEWOOD TACOMA WA","Withdrawal Debit Card Check Card U-HAUL OF LAKEWOOD TACOMA WA","47.24","debit","Home Services","CHECKING CL","",""
"Withdrawal Home Banking Transfer To Loan 80 TRANSFER","Withdrawal Home Banking Transfer To Loan 80 TRANSFER","100.00","debit","Credit Card Payment","CHECKING CL","",""
"Withdrawal Home Banking Transfer To Loan 80 TRANSFER","Withdrawal Home Banking Transfer To Loan 80 TRANSFER","185.69","debit","Credit Card Payment","CHECKING CL","",""
"Withdrawal POS #311216404990 POS SAFEWAY #1645 LAKEWOOD WA","Withdrawal POS #311216404990 POS SAFEWAY #1645 LAKEWOOD WA","102.87","debit","Groceries","CHECKING CL","",""
"Withdrawal","Withdrawal","120.00","debit","Cash & ATM","CHECKING CL","",""
"Withdrawal","Withdrawal","300.00","debit","Cash & ATM","CHECKING CL","",""
"""


sound_checking_entities = {
    "SCH-001": {
        "qualifiers": ["Withdrawal ACH LIGHTSTREAM", ],
        "category": "Loan",
        "credit": False,
        "tags": ["loan"],
        "hint": "Crawlspace Loan"
    },
    "SCH-002": {
        "qualifiers": ["Deposit ACH SIP US LLC TYPE: DIRECT DEP", ],
        "category": "Salary",
        "credit": True,
        "tags": [],
        "hint": "Salary"
    },
    "SCH-003": {
        "qualifiers": ["Withdrawal ACH MOVEMENT MTG", ],
        "category": "Loan",
        "credit": False,
        "tags": ["loan"],
        "hint": "Mortgage"
    },
    "SCH-004": {
        "qualifiers": ["Withdrawal Home Banking Transfer To Share 00 TRANSFER", ],
        "category": "Transfer To",
        "credit": False,
        "tags": ["transfer"],
        "hint": "To Checking Christa"
    },
    "SCH-005": {
        "qualifiers": ["Withdrawal Home Banking Transfer To Loan 80 TRANSFER", ],
        "category": "Transfer To",
        "credit": False,
        "tags": ["transfer"],
        "hint": "To Credit Card"
    },
    "SCH-006": {
        "qualifiers": ["PAYPAL", ],
        "category": "Goods",
        "credit": False,
        "tags": [],
        "hint": "PayPal"
    },
    "SCH-007": {
        "qualifiers": ["Safeway", ],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Safeway"
    },
    "SCH-008": {
        "qualifiers": ["Cash & ATM", ],
        "category": "Cash",
        "credit": False,
        "tags": [],
        "hint": "Cash"
    },
    "SCH-009": {
        "qualifiers": ["Deposit Home Banking Transfer From Share 00 TRANSFER", ],
        "category": "Transfer From",
        "credit": False,
        "tags": [],
        "hint": "Transfer"
    }
}


"""
"Date","Description","Original Description","Amount","Transaction Type","Category","Account Name","Labels","Notes"
"Loan Advance Credit Card Credit Card ALANMACKSDENTISTRY 125-35928791 WA","Loan Advance Credit Card Credit Card ALANMACKSDENTISTRY 125-35928791 WA","572.80","debit","Credit Card Payment","SELECT VISA","",""
"Loan Advance Credit Card Credit Card LOWES #00907* 866-483-7521 NC","Loan Advance Credit Card Credit Card LOWES #00907* 866-483-7521 NC","108.09","debit","Shopping","SELECT VISA","",""
"Loan Advance Credit Card Credit Card MCDONALD'S F35934 TACOMA WA","Loan Advance Credit Card Credit Card MCDONALD'S F35934 TACOMA WA","19.95","debit","Fast Food","SELECT VISA","",""
"Loan Advance Credit Card Credit Card NEW 2 YOU LLC PORT ORCHARD WA","Loan Advance Credit Card Credit Card NEW 2 YOU LLC PORT ORCHARD WA","73.78","debit","Credit Card Payment","SELECT VISA","",""
"Loan Advance Credit Card Credit Card SQ *EMILY'S GARAGE TACO Tacoma WA","Loan Advance Credit Card Credit Card SQ *EMILY'S GARAGE TACO Tacoma WA","194.06","debit","Restaurants","SELECT VISA","",""
"Loan Advance Credit Card Credit Card TACOMA GOODWILL INDUST TACOMA WA","Loan Advance Credit Card Credit Card TACOMA GOODWILL INDUST TACOMA WA","73.00","debit","Shopping","SELECT VISA","",""
"Loan Advance Credit Card Credit Card WM SUPERCENTER #4137 TACOMA WA","Loan Advance Credit Card Credit Card WM SUPERCENTER #4137 TACOMA WA","130.46","debit","Shopping","SELECT VISA","",""
"Payments Home Banking Transfer From Share 00 TRANSFER","Payments Home Banking Transfer From Share 00 TRANSFER","25.00","credit","Transfer","SELECT VISA","",""
"Payments Home Banking Transfer From Share 10 TRANSFER","Payments Home Banking Transfer From Share 10 TRANSFER","100.00","credit","Transfer","SELECT VISA","",""

"""
sound_visa_entities = {
    "SV-000": {
        "qualifiers": ["ALANMACKSDENTISTRY", ],
        "category": "Service",
        "credit": False,
        "tags": [],
        "hint": "Dentist"
    },
    "SV-001": {
        "qualifiers": ["Lowes", ],
        "category": "Home Improvement Supplies",
        "credit": False,
        "tags": [],
        "hint": "Lowes"
    },
    "SV-002": {
        "qualifiers": ["Mcdonald", ],
        "category": "Fast Food/Resaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "SV-003": {
        "qualifiers": ["New 2 you", ],
        "category": "Thrift Store",
        "credit": False,
        "tags": [],
        "hint": "Thrift"
    },
    "SV-004": {
        "qualifiers": ["Goodwill", ],
        "category": "Thrift Store",
        "credit": False,
        "tags": [],
        "hint": "Thrift"
    },
    "SV-005": {
        "qualifiers": ["Transfer From Share 00 TRANSFER", ],
        "category": "Transfer From",
        "credit": True,
        "tags": [],
        "hint": "Transfer"
    },
    "SV-006": {
        "qualifiers": ["Transfer From Share 10 TRANSFER", ],
        "category": "Transfer From",
        "credit": True,
        "tags": [],
        "hint": "Transfer"
    },
    "SV-007": {
        "qualifiers": ["EMILY'S GARAGE TACO", ],
        "category": "Service",
        "credit": False,
        "tags": [],
        "hint": "Mechanic"
    },
    "SV-008": {
        "qualifiers": ["WM SUPERCENTER", ],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Grocieries"
    },
    "SV-009": {
        "qualifiers": ["Loan Advance Credit Card Credit Card MCDONALD"],
        "category": "Fast Food/Resaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    }

}


"""
"Deposit Home Banking Transfer From Share 00 TRANSFER","Deposit Home Banking Transfer From Share 00 TRANSFER","300.00","credit","Transfer","S10 FREE CHECKIN","",""
"Withdrawal ACH PAYPAL TYPE: INST XFER ID: PAYPALSI77 CO: PAYPAL NAME: CHRISTA SMILEY","Withdrawal ACH PAYPAL TYPE: INST XFER ID: PAYPALSI77 CO: PAYPAL NAME: CHRISTA SMILEY","175.15","debit","Shopping","S10 FREE CHECKIN","",""
"Withdrawal Debit Card Check Card BCF Etsy Uplift 718-4807500 NY","Withdrawal Debit Card Check Card BCF Etsy Uplift 718-4807500 NY","0.55","debit","Shopping","S10 FREE CHECKIN","",""
"Withdrawal Debit Card Check Card Etsy.com - Multiple Sho 718-8557955 NY","Withdrawal Debit Card Check Card Etsy.com - Multiple Sho 718-8557955 NY","177.45","debit","Shopping","S10 FREE CHECKIN","",""
"Withdrawal Debit Card Check Card LIFE CENTER THRIFT STOR TACOMA WA","Withdrawal Debit Card Check Card LIFE CENTER THRIFT STOR TACOMA WA","20.68","debit","Shopping","S10 FREE CHECKIN","",""
"Withdrawal POS #303700004691 POS FRED-MEYER #0615 FRED MEYER 615 UNIVERSITY PL WA","Withdrawal POS #303700004691 POS FRED-MEYER #0615 FRED MEYER 615 UNIVERSITY PL WA","90.80","debit","Groceries","S10 FREE CHECKIN","",""
"Withdrawal POS #307719974651 POS SAFEWAY #3411 TACOMA WA","Withdrawal POS #307719974651 POS SAFEWAY #3411 TACOMA WA","52.79","debit","Groceries","S10 FREE CHECKIN","",""
"Withdrawal POS #309321017815 POS WALGREENS STORE 8224 ST LAKEWOOD WA","Withdrawal POS #309321017815 POS WALGREENS STORE 8224 ST LAKEWOOD WA","12.44","debit","Pharmacy","S10 FREE CHECKIN","",""
"Withdrawal","Withdrawal","100.00","debit","Cash & ATM","S10 FREE CHECKIN","",""
"Withdrawal POS #302821154179 POS SQ *DT VINTAGE & MORE... SQUARE PURCHASE NORTH BEND WA","Withdrawal POS #302821154179 POS SQ *DT VINTAGE & MORE... SQUARE PURCHASE NORTH BEND WA","79.57","debit","Restaurants","S10 FREE CHECKIN","",""

"""
sound_checking_entities_christa = {
    "SCC-000": {
        "qualifiers": ["Deposit Home Banking Transfer From Share 00 TRANSFER", ],
        "category": "Transfer From",
        "credit": False,
        "tags": [],
        "hint": "Transfer"
    },
    "SCC-001": {
        "qualifiers": ["Paypal", ],
        "category": "Goods",
        "credit": False,
        "tags": [],
        "hint": "PayPal"
    },
    "SCC-002": {
        "qualifiers": ["Etsy", ],
        "category": "Hobby",
        "credit": False,
        "tags": [],
        "hint": "Etsy"
    },
    "SCC-003": {
        "qualifiers": ["Thrift", ],
        "category": "Thrift Store",
        "credit": False,
        "tags": [],
        "hint": "Thrift Store"
    },
    "SCC-004": {
        "qualifiers": ["Walgreens", ],
        "category": "Pharmacy",
        "credit": False,
        "tags": [],
        "hint": "Pharmacy"
    },
    "SCC-005": {
        "qualifiers": ["Fred Meyer", ],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Groceries"
    },
    "SCC-006": {
        "qualifiers": ["Safeway", ],
        "category": "Groceries",
        "credit": False,
        "tags": [],
        "hint": "Grocieries"
    },
    "SCC-007": {
        "qualifiers": ["Cash & ATM", ],
        "category": "Cash",
        "credit": False,
        "tags": [],
        "hint": "Cash",
        "match_all_qualifiers": False       # Possible way to use broader search
    },
    "SCC-008": {
        "qualifiers": ["STARBUCKS", ],
        "category": "Fast Food/Restaurant",
        "credit": False,
        "tags": [],
        "hint": "Fastfood"
    },
    "SCC-009": {
        "qualifiers": ["DT VINTAGE", ],
        "category": "Thrift Store",
        "credit": False,
        "tags": [],
        "hint": "Thrift"
    }
}


def check_for_entities(data, entities):
    # Search all entities passed in for matching qualifiers
    for entity_id, v in entities.items():
        assert isinstance(v, dict), f"Found wrong data type {type(v)}"
        qualifiers = v['qualifiers']
        match_all = v.get('match_all_qualifiers', True)  # match all by default
        check_category = v.get('check_category', False)
        found_count = 0

        for desc in qualifiers:
            if desc.upper() in data.description.upper():
                found_count += 1
            else:
                if desc.upper() in data.category.upper():
                    found_count += 1

        if found_count == len(qualifiers) or (found_count > 0 and match_all is False):
            return entity_id
    return None


def build_entity_description(key, entities):
    desc = ""
    for item in entities[key]['qualifiers']:
        desc += f"{item},"
    return desc
