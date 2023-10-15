// https://react-bootstrap.netlify.app/docs/components/navbar
import React, {useContext, useState} from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import Select from "react-select";
import {CategoriesContext} from "../../contexts/categories.context.jsx";
import {TagsContext} from "../../contexts/tags.context.jsx";
import TagSelectorComponent from "../tag-selector/tag-selector.component.jsx";
// import './horizontal-navbar.component.styles.css'

/*
        'hideUncategorized': false,
        'useDateRange': false,
        'useTags': false,
        'useCategories': false,
        'useInstitutions': false


 */
function HorizontalNavBar() {
    const [templateView, setTemplateView] = useState(true);
    const {tagsMap} = useContext(TagsContext);
    const {categoriesMap} = useContext(CategoriesContext);

    const handleSelect = (eventKey) => {
        alert(`selected ${eventKey}`);
        switch (eventKey) {
            case 'templateView':
                setTemplateView(!templateView);
                break;
            case 'categoryView':
                break;
            case 'hideUncategorized':
                break;
            case 'useTagFilter':
                break;
            case 'useCategoryFilter':
                break;
            case 'useInstitutionFilter':
                break;
            default: console.log("Unknown eventKey: ", eventKey);
        }
    }
    const transaction = {
        "tags": []
    }

    const changeTag = async (transaction_id, tag_list) => {
        // event contains an array of active entries in the select
        console.log("Tags for: ", transaction_id);
        console.log("        : ", tag_list);
    }

    // Format list
    const options = []
    categoriesMap.forEach((item) => {
        options.push({value: item.id, label: item.value});
    })

    const updateCategory = (event) => {
        console.log("Update Category: ", typeof event);
        // setSelection(event.value);
    }

    // Sort comparator
    function compareCategories(a, b) {
        return ('' + a.label.toLowerCase()).localeCompare(b.label.toLowerCase());
    }

    return (
        <nav className="navbar navbar-expand-xxl navbar-light bg-light">
            <a className="navbar-brand" href="#">Navbar</a>
            <button className="navbar-toggler"
                    type="button" data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item active">
                        <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Link</a>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Dropdown
                        </a>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <a className="dropdown-item" href="#">Action</a>
                            <a className="dropdown-item" href="#">Another action</a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="#">Something else here</a>
                        </div>
                    </li>
                    <li className="nav-item">
                        <a class="nav-link disabled" href="#">Disabled</a>
                    </li>
                </ul>
                <form class="form-inline my-2 my-lg-0">
                    <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"/>
                    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                </form>
            </div>
        </nav>
    );
}

export default HorizontalNavBar;
