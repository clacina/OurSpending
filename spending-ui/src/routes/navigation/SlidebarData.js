import React from "react";

import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

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
        icon: <IoIcons.IoMdPeople />,
        cName: "nav-text"
    },
    {
        title: "Templates",
        path: "/templates",
        icon: <FaIcons.FaEnvelopeOpenText />,
        cName: "nav-text"
    },
    {
        title: "Batches",
        path: "/batches",
        icon: <IoIcons.IoMdHelpCircle />,
        cName: "nav-text"
    },
    {
        title: "Processed Batches",
        path: "/processed_batches",
        icon: <IoIcons.IoMdHelpCircle />,
        cName: "nav-text"
    },
    {
        title: "Categories",
        path: "/categories",
        icon: <IoIcons.IoIosPaper />,
        cName: "nav-text"
    },
    {
        title: "Tags",
        path: "/tags",
        icon: <FaIcons.FaCartPlus />,
        cName: "nav-text"
    },
];
