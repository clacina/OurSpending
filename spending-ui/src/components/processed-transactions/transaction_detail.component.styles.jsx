import styled from "styled-components";
import {BaseButton} from '../button/button.styles.jsx'

export const ItemTable = styled.table`
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);

  thead tr {
    background-color: #009879;
    color: #ffffff;
    text-align: left;
  }

  th,
  td {
    padding: 12px 15px;
  }

  tbody tr {
    border-bottom: 1px solid #dddddd;
  }

  tbody tr:nth-of-type(even) {
    background-color: #f3f3f3;
  }

  tbody tr:last-of-type {
    border-bottom: 2px solid #009879;
  }

  tbody tr.active-row {
    font-weight: bold;
    color: #009879;
  }

  td {
    border-left: 1px solid #000;
  }

  td:first-child {
    border-left: none;
  }
`;

export const TitleSpacer = styled.span`
  width: 250px;
  margin-right: -250px;
`;

export const TotalSpacer = styled.span`
  float: right;
  text-align: right;
  margin-left: 250px;
  margin-right: 30px;
`;

export const CButton = styled(BaseButton)`
  position: absolute;
  left: 50%;
  bottom: 15px;
  transform: translate(-50%, -15px);
`;

export const sub_format = styled.p`
    margin-left: 10px;
    color: red;
`;
