import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <h3>This is landing page</h3>

      <Link to="/Register">Register</Link>{" | "}
      <Link to="/Login">Login</Link>{" | "}
  

      <Routes>
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/h" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
