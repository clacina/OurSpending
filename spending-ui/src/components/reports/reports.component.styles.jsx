import styled from "styled-components";
import Select from "react-select";

export const ChartColumn = styled.div`
  flex: 50%;
  border: 1px solid black;
`

export const FilterColumn = styled.div`
  flex: 50%;
  background-color: mediumaquamarine;
`

export const ReportRow = styled.div`
  display: flex;
  //  background-color: #CBB700;
`

export const FilterRow = styled.div`
  width: 100%;
  //height: 40px;
  border: 1px solid red;
  padding-top: 15px;
  padding-bottom: 15px;

  label {
    position: relative;
    margin-left: 10px;
    margin-right: 10px;
  }

  button {
    margin-left: 400px;
    padding-left: 5px;
    padding-right: 5px;
  }
`

export const FilterSelect = styled(Select)`
    margin-left: 100px;
    width: 400px;
    position: fixed;
    margin-top: -30px;
`
