import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SiriLogo from "./Components/SiriLogo";
import SiriHome from "./Pages/SiriHome";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Customers from "./Pages/Customers";
import Products from "./Pages/Products";
import Orders from "./Pages/Orders";
import AddOrder from "./Pages/AddOrder";
import OrderDetails from "./Pages/OrderDetails";
import Payments from "./Pages/Payments";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SiriLogo />} />

        <Route path="/siridigitals" element={<SiriHome />} />

        <Route path="/siridigitals/login" element={<Login />} />

        <Route path="/siridigitals/dashboard" element={<Dashboard />} />

        <Route path="/siridigitals/customers" element={<Customers />} />

        <Route path="/siridigitals/products" element={<Products />} />

        <Route path="/siridigitals/orders" element={<Orders />} />

        <Route path="/siridigitals/orders/new" element={<AddOrder />} />

        <Route path="/siridigitals/orders/:id" element={<OrderDetails />} />

        <Route path="/siridigitals/payments" element={<Payments />} />
      </Routes>
    </Router>
  );
}

export default App;
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import SiriLogo from './Components/SiriLogo';
// import SiriHome from './Pages/SiriHome';
// import './App.css';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<SiriLogo />} />
//         <Route path="/siridigitals" element={<SiriHome />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
