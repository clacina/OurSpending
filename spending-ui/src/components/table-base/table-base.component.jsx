import React, {useState} from "react";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import {contextMenu, Item, Menu, Separator, Submenu} from "react-contexify";


const TableBaseComponent = ({columns, data, keyField, double_click_handler, ...otherProps}) => {
    const [activeRow, setActiveRow] = useState(0);

    const rowStyle = (row) => {
        if (row === activeRow) {
            return {
                backgroundColor: "lightcyan",
                border: "solid 2px grey",
                color: "purple"
            };
        }
    };

    const showContext = (event, row) => {
        console.log("showContext: ", event);
        setActiveRow(row);
        event.preventDefault();
        contextMenu.show({
            id: "context-menu",
            event: event
        });
    };

    const rowEvents = {
        onClick: (e, row, index) => {setActiveRow(row);},
        onContextMenu: (e, row, index) => {showContext(e, row);}
    };

    if(double_click_handler) {
        rowEvents['onDoubleClick'] = (e, row, index) => {double_click_handler(e, row, index)}
    }

    return (
        <div>
            <BootstrapTable
                keyField={keyField}
                data={data}
                columns={columns}
                {...otherProps}
                rowEvents={rowEvents}
                rowStyle={rowStyle}
            />
            <Menu id="context-menu" theme='dark'>
                {activeRow && (
                    <>
                        <Item className="text-center">Header row {activeRow.id}</Item>
                        <Separator/>
                        {["Google", "Apple"].includes("Google") && (
                            <Submenu label="Contact" arrow=">">
                                <Item>Phone</Item>
                                <Item>Email</Item>
                            </Submenu>
                        )}
                        <Item disabled={true}>Add to Cart</Item>
                    </>
                )}
            </Menu>
        </div>
    )
}

export default TableBaseComponent;
