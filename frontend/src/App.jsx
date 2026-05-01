import Login from "./login";
import Welcomeuser from "./components/UserManagement-Folder/welcomeuser";
import Welcomeadmin from "./components/UserManagement-Folder/welcomeadmin";
import UserManagement from "./components/UserManagement-Folder/usermanagement";
import TopProduct from "./components/MainFolder/topproduct.jsx";
import Sales from "./components/MainFolder/sales.jsx";
import ActivLog from "./components/MainFolder/ActivLog.jsx";
import Monthlyreport from "./components/MainFolder/Monthlyreport.jsx";
import TotalRevenue from "./components/MainFolder/TotalRevenue.jsx";
import Available from "./components/MainFolder/Available.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>  
      <Routes>
         <Route path="/" element={<Login/>} />
        <Route path="/Login" element={<Login />} />
        <Route path="/welcomeuser" element={<Welcomeuser />} />
        <Route path="/welcomeadmin" element={<Welcomeadmin />} />
        <Route path="/usermanagement" element={<UserManagement/>}/> 
        <Route path="/topproduct" element={<TopProduct/>}/>
        <Route path="/sales" element={<Sales/>}/>
        <Route path="/activlog" element={<ActivLog/>}/>
        <Route path="/monthlyreport" element={<Monthlyreport/>}/>
        <Route path="/totalrevenue" element={<TotalRevenue/>}/>
        <Route path="/available" element={<Available/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;