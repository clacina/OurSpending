import React from "react";

import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
// import * as IoIcons from "react-icons/io";
import { GiChart } from "react-icons/gi";
import { TbReportMoney, TbReportSearch } from "react-icons/tb";
import { GrCloudComputer } from "react-icons/gr";
import { GiComputerFan } from "react-icons/gi";


export const SidebarData = [
    {
        title: "Home",
        path: "/",
        icon: <AiIcons.AiFillHome />,
        cName: "nav-text"
    },
    {
        title: "Banks",
        path: "/banks",
        icon: <FaIcons.FaUniversity />,
        cName: "nav-text"
    },
    {
        title: "Transaction Batches",
        path: "/batches",
        icon: <FaIcons.FaList />,
        cName: "nav-text"
    },
    {
        title: "Templates",
        path: "/templates",
        icon: <FaIcons.FaAddressCard />,
        cName: "nav-text"
    },
    {
        title: "Categories",
        path: "/categories",
        icon: <FaIcons.FaObjectGroup />,
        cName: "nav-text"
    },
    {
        title: "Processed Batches",
        path: "/processed_batches",
        icon: <GiComputerFan   />,
        cName: "nav-text"
    },
    {
        title: "Tags",
        path: "/tags",
        icon: <FaIcons.FaTags />,
        cName: "nav-text"
    },
    {
        title: "Template Report",
        path: "/reports/template",
        icon: <TbReportSearch />,
        cName: "nav-text",
    },
    {
        title: "Category Report",
        path: "/reports/category",
        icon: <TbReportMoney />,
        cName: "nav-text",
    },
    {
        title: "Spending Chart",
        path: "/reports",
        icon: <GiChart  />,
        cName: "nav-text",
    },
    {
        title: "Credit Cards",
        path: "/cards",
        icon: <FaIcons.FaRegCreditCard  />,
        cName: "nav-text",
    },
    {
        title: "Faire",
        path: "/faire",
        icon: <FaIcons.FaRegCreditCard  />,
        cName: "nav-text",
    },
    {
        title: "Events",
        path: "/events",
        icon: <FaIcons.FaRegCreditCard  />,
        cName: "nav-text",
    },
];
