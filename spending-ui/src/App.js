import './App.css';
import TempComponent from "./routes/temp/temp.component";
import {Route, Routes} from "react-router-dom";

import Navbar from "./routes/navigation/navigation.component";
import Home from "./routes/home/home.component";
import {Fragment} from "react";

function App() {
  return (
      <Fragment>
          <Navbar />
          <Routes>
              <Route index element={<Home/>}/>
              <Route path='categories/*' element={<TempComponent/>}/>
              <Route path='tags/*' element={<TempComponent/>}/>
              <Route path='banks/*' element={<TempComponent/>}/>
              <Route path='templates/*' element={<TempComponent/>}/>
              <Route path='batches/*' element={<TempComponent/>}/>
              <Route path='transactions/*' element={<TempComponent/>}/>
              <Route path='processed_batches/*' element={<TempComponent/>}/>
              <Route path='processed_transactions/*' element={<TempComponent/>}/>
          </Routes>
      </Fragment>
  );
}

export default App;
