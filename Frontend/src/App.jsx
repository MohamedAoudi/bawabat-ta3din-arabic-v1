import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Countries from "./pages/Countries";
import M1Page from "./pages/M1";
import M2Page from "./pages/M2";
import M3Page from "./pages/M3";
import M4Page from "./pages/M4";
import M5Page from "./pages/M5";
import M6Page from "./pages/M6";
import M7Page from "./pages/M7";
import M8Page from "./pages/M8";
import Rapport from "./pages/Rapport";

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
        <Route path="/m5" element={<M5Page />} />
        <Route path="/m6" element={<M6Page />} />
        <Route path="/m7" element={<M7Page />} />
        <Route path="/m8" element={<M8Page />} />
        <Route path="/rapport" element={<Rapport />} />

      </Routes>
    </BrowserRouter>
  );
}