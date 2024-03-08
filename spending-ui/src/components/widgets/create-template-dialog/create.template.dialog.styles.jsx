import styled from 'styled-components'

export const BaseButton = styled.button`
  min-width: 165px;
  width: auto;
  height: 50px;
  letter-spacing: 0.5px;
  line-height: 50px;
  padding: 0 35px 0 35px;
  font-size: 15px;
  background-color: black;
  color: white;
  text-transform: uppercase;
  font-family: 'Open Sans', sans-serif;
  font-weight: bolder;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;

  &:hover {
    background-color: white;
    color: black;
    border: 1px solid black;
  }
`;

export const InstitutionName = styled.p`
    margin-left:10px;
`;

export const ExistingQualifierList = styled.table`
  table-layout: fixed;
  width: 100%;
  border: 1px solid black;
  margin-bottom: 10px;  
  border-collapse: collapse;
  th, td {
    padding: 10px;
  } 
`;
