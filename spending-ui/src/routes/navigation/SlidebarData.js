import React from "react";

import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
// import * as IoIcons from "react-icons/io";

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
        title: "Templates",
        path: "/templates",
        icon: <FaIcons.FaAddressCard />,
        cName: "nav-text"
    },
    {
        title: "Batches",
        path: "/batches",
        icon: <FaIcons.FaList />,
        cName: "nav-text"
    },
    {
        title: "Processed Batches",
        path: "/processed_batches",
        icon: <FaIcons.FaDesktop />,
        cName: "nav-text"
    },
    {
        title: "Categories",
        path: "/categories",
        icon: <FaIcons.FaObjectGroup />,
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
        icon: <FaIcons.FaBook />,
        cName: "nav-text",
    },
    {
        title: "Category Report",
        path: "/reports/category",
        icon: <FaIcons.FaBook />,
        cName: "nav-text",
    },
    {
        title: "Spending Chart",
        path: "/reports",
        icon: <FaIcons.FaBook />,
        cName: "nav-text",
    },
];
