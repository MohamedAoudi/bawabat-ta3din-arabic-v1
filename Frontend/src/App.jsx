import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Countries from "./pages/countries";
import M1Page from "./pages/m1";
import M2Page from "./pages/M2";
import M3Page from "./pages/M3";
import M4Page from "./pages/M4";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/m1" element={<M1Page />} />
        <Route path="/m2" element={<M2Page />} />
        <Route path="/m3" element={<M3Page />} />
        <Route path="/m4" element={<M4Page />} />


      </Routes>
    </BrowserRouter>
  );
}