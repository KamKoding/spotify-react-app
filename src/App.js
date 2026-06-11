import "./index.css"
import Nav from "./components/Nav";
import Home from "./Pages/Home";
import Callback from "./Pages/Callback";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="app">
        <Nav />
        <Routes>
          <Route path="/" element = {<Home />}></Route>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
