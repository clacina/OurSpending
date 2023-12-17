/*
    Original code: https://codesandbox.io/s/react-sidebar-navigation-menu-0hkkj?file=/src/components/SlidebarData.js
 */

import React, {useContext, useEffect, useState} from "react";

// ICONS
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";

import { IconContext } from "react-icons";

// ROUTING

import { Link } from "react-router-dom";

// DATA FILE
import { SidebarData } from "./SlidebarData";

// STYLES
import './navigation.component.styles.css';

import {StaticDataContext} from "../../contexts/static_data.context";

const MenuBar = () => {
    const [sidebar, setSidebar] = useState(false);
    const {sectionTitle} = useContext(StaticDataContext);
    const showSidebar = () => setSidebar(!sidebar);

    return (
        <>
            <IconContext.Provider value={{ color: "#FFF" }}>
                {/* All the icons now are white */}
                <div className="navbar">
                    <Link to="#" className="menu-bars">
                        <FaIcons.FaBars onClick={showSidebar} />
                    </Link>
                    <div>
                        <h1>{sectionTitle}</h1>
                    </div>
                    <div>
                        <h2>Our Spending - Lacinas Lair</h2>
                    </div>
                </div>
                <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
                    <ul className="nav-menu-items" onClick={showSidebar}>
                        <li className="navbar-toggle">
                            <Link to="#" className="menu-bars">
                                <AiIcons.AiOutlineClose />
                            </Link>
                        </li>

                        {SidebarData.map((item, index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </IconContext.Provider>
        </>
    );
}

export default MenuBar;
