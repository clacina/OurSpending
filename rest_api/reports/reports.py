import datetime
import decimal
import locale
import logging


class ReportData:
    def __init__(self):
        self.categories = []
        self.tags = []
        self.institutions = []
        self.start_date = datetime.date(2023, 1, 1)
        self.end_date = datetime.date(2023, 6, 1)

    def get_category(self, id):
        return [x for x in self.categories if x[0] == id][0]

    def get_bank(self, institution_id):
        label = [x[1] for x in self.institutions if x[0] == institution_id][0]
        return label


class Reporting:
    def __init__(self, report_data):
        self.report_data = report_data

    @staticmethod
    def _report_header(outfile):
        outfile.write(
            """
            
            <html><head>
            <link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css">
            <style>
            .section_div {
                border:1px solid gray;
                margin-left: 10px;
                padding-left: 10px;
                margin-top: 10px;
                padding-bottom: 10px;
            } 
            .sub_section_div {
                margin-left: 10px;
                padding-left: 10px;
                margin-top: 10px;
                padding-right: 10px;
                padding-bottom: 10px;
            } 
            th {
                background-color: LightGray;                
            }
            td {
                padding: 5;
            }
            .sub_section_div td {
                background-color: White;
            }
            .right {
                text-align: right;
                margin-right: 1em;
            }            
            .tx_div {
                background: LightCyan;
                overflow: auto;                
            }
            .fixed_table {
                table-layout: fixed;
                width: 90%
            }
            </style>
            
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
            <script src="https://code.jquery.com/jquery-3.5.1.js"></script>
            <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
                        
            <script>
                window.onload = function() {
                    click_category = function(id) {
                        // figure out div id
                        div_id = "d_" + id;
                        our_div = document.getElementById(div_id);
                        if (our_div.style.display !== "none") {
                            our_div.style.display = "none";
                        } else {
                            our_div.style.display = "";
                        }
                    };
                };

                $(".use-address").click(function() {
                    var $item = $(this).closest("tr")   // Finds the closest row <tr> 
                                       .find(".nr")     // Gets a descendent with class="nr"
                                       .text();         // Retrieves the text within <td>
                
                    $("#resultas").append($item);       // Outputs the answer
                });
                
                
                $(document).ready(function () {
                    console.log("CJL-Registering our data tables");
                    $('.first_table').DataTable();
                    console.log("CJL-DONE-Registering our data tables");
                });                
            </script>
            </head><body>\n"""
        )

    @staticmethod
    def _report_footer(outfile):
        outfile.write("</body></html>\n")

    def _report_title(self, outfile, report_title):
        outfile.write(
            f"<h1>{report_title}</h1><p>{self.report_data.start_date} - {self.report_data.end_date}</p>\n"
        )
        outfile.write(f"<p>{datetime.datetime.now()}</p>\n")

    def template_verification_report(
        self, processor_list, reportfile, include_spending=True, include_extras=True
    ):
        with open(reportfile, "wt", encoding="utf-8") as outfile:
            self._report_header(outfile)
            self._report_title(outfile, "Template Verification Report")
            outfile.write(
                "<p>Use this report to verify transactions were matched to the correct templates.</p>\n"
            )

            for p in processor_list:
                outfile.write('<div class="section_div">\n')
                self._line_item_report(p, outfile, include_spending, include_extras)
                outfile.write("</div>\n")

            self._report_footer(outfile)

    @staticmethod
    def _preprocess_category_verification_data(processor_list):
        new_category_breakdown = {}

        for proc in processor_list:
            """
            self.spending[template.id] = {
                "banking_entity": template,
                "transactions": list(),
            }
            """
            for template_id, template_transactions in proc.spending.items():
                category_id = template_transactions["banking_entity"].category_id

                # sum all transactions
                category_value = 0.0
                for t in template_transactions["transactions"]:
                    if t.amount < 0:
                        t.amount = 0 - t.amount
                    category_value += t.amount

                # build data for downstream reporting
                if category_id not in new_category_breakdown:
                    new_category_breakdown[category_id] = {
                        "count": 0,
                        "amount": 0.0,
                        "credit": "",
                        "transactions": list(),
                    }
                cb_item = new_category_breakdown[category_id]
                cb_item["count"] += 1
                cb_item["amount"] += category_value
                cb_item["transactions"].extend(
                    template_transactions["transactions"]
                )
                if template_transactions["banking_entity"].credit:
                    cb_item["credit"] = "+"  # Indicate credit vs debit
        return new_category_breakdown

    def category_verification_report(self, processor_list, reportfile):
        new_category_breakdown = self._preprocess_category_verification_data(processor_list)

        locale.setlocale(locale.LC_ALL, "")
        with open(reportfile, "wt") as outfile:
            self._report_header(outfile)
            self._report_title(outfile, "Category Report")
            outfile.write(
                "<p>Use this report to verify that all transactions have the correct, corresponding categories.</p>\n"
            )
            outfile.write(
                "<p><b><i>Only transactions that have matching templates are displayed.  Check the Template Verification report if you don't see all the transactions.</i></b></p>\n"
            )

            outfile.write(
                '<table border=1 class="fixed_table"><thead><tr><th style="width: 50px;">Id</th><th>Value</th><th  '
                'style="width: 50px;">Count</th><th style="width: 80px;">Spend</th>\n'
            )
            for c in self.report_data.categories:
                cat = new_category_breakdown.get(c[0], None)
                if cat:
                    line_id = c[0]
                    name = c[1]
                    transaction_list = cat["transactions"]

                    outfile.write(
                        f'<tr><td>{line_id}</td><td><a href="javascript:click_category({line_id})" '
                    )
                    out_string = f'id="c_{line_id}">{name}</a></td><td class="right">{len(transaction_list)}</td>'
                    outfile.write(out_string)
                    outfile.write(
                        f'<td class="right">{cat["credit"]}{locale.currency(cat["amount"], grouping=True)}</td></tr>\n'
                    )

                    outfile.write(
                        f'<tr id="d_{line_id}" style="display: none;"><td colspan=4><div class="tx_div">\n'
                    )
                    # Insert our transaction records
                    if cat["transactions"]:
                        outfile.write(
                            '<table class="sub_section_div" width=100%><thead><tr><th>Transaction '
                            'Id</th><th>Date</th><th>Amount</th><th>Description</th><th>Bank</th><th>Template</th></tr></thead>\n'
                        )

                        for t in transaction_list:
                            outfile.write(
                                f'<tr><td  class="right">{t.transaction_id}</td><td>{t.date}</td><td class="right">{t.amount}</td><td>{t.description}</td><td>{self.report_data.get_bank(t.institution_id)}</td><td>{t.template_id}</td></tr>\n'
                            )
                        outfile.write("</table>\n")

                    outfile.write(f"</div></td></tr>\n")

            outfile.write("</table>\n")

            self._report_footer(outfile)

    def _draw_spending_table(
        self, processor, outfile, total_spending_count, verbose=False
    ):
        outfile.write(f"<h3>Spending</h3>\n")
        outfile.write(f"<p>{total_spending_count} Transactions</p>\n")

        outfile.write("<table border=1>\n")
        outfile.write(
            "<thead><tr><th>Template ID</th><th># Transactions</th><th>Total</th><th>Category</th><th>Description</th"
            "></tr></thead>\n"
        )
        for k, v in processor.spending.items():
            # logging.info(f"spending items: {k}: {v}")
            """
             spending items: 92: {'banking_entity': (92, 'Chris Software', False, '', 1, 'Wellsfargo Checking', 'WLS_CHK', None, None, None, None, 4, "Chris's 
             Training / Development", 226, 'paddle.com'), 'transactions': [<rest_api.reports.processor_base.ProcessingTransaction object at 0x0000015C57D78590>]}            
            """
            # desc = " | ".join(v["banking_entity"].qualifiers)
            desc = v['banking_entity'][14]
            amount = decimal.Decimal(0.0)
            category = k
            for item in v["transactions"]:
                amount += item.amount

            outfile.write("<tr>")
            outfile.write(
                f'<td  class="right">{k}</td><td  class="right">{len(v["transactions"])}</td><td class="right">${amount}</td><td>{category}</td><td bgcolor="blue" style="color: white;">{desc}</td>'
            )
            outfile.write("</tr>\n")
            if verbose:  # list all transactions below
                outfile.write(
                    '<tr><td colspan=5 bgcolor="MediumSeaGreen"><table class="sub_section_div" '
                    'width=90%><thead><tr><th>Transaction '
                    'Id</th><th>Date</th><th>Amount</th><th>Description</th></tr></thead>\n'
                )

                for t in v["transactions"]:
                    outfile.write(
                        f'<tr><td  class="right">{t.transaction_id}</td><td class="right">{t.transaction_date}</td><td class="right">{t.amount}</td><td>{t.description}</td></tr>\n'
                    )
                outfile.write("</table>\n")

        outfile.write("</table>\n")

    def _draw_extras_table(self, processor, outfile):
        outfile.write(
            f"<h3>Unrecognized Transactions</h3><p>{len(processor.unrecognized_transactions)} Transactions</p>\n"
        )

        outfile.write(
            '<table class="first_table cell-border"><thead><tr><th>Id</th><th>Date</th><th>Amount</th><th>Description</th></tr></thead>\n'
        )
        for e in processor.unrecognized_transactions:
            outfile.write(
                f'<tr><td class="right">{e.transaction_id}</td><td class="right">{e.transaction_date}</td><td class="right">${e.amount}</td><td>{e.description}</td></tr>\n'
            )

        outfile.write("</table>\n")

    def _line_item_report(
        self, processor, outfile, include_spending=True, include_extras=True
    ):
        logging.info({
            "message": "line item report",
            "bank": processor.name
        })
        # Validate that entry counts match
        total_spending_count = processor.calc_spending_item_count()

        outfile.write(
            f"<h2>{processor.name}</h2> <p>{len(processor.transactions)} Transactions</p>\n"
        )

        if include_spending:
            self._draw_spending_table(
                processor, outfile, total_spending_count, verbose=True
            )

        if include_extras and len(processor.unrecognized_transactions):
            self._draw_extras_table(processor, outfile)
