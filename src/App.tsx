// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/login";
import PainelPais from "./pages/PainelPais";
import PainelColaboradora from "./pages/PainelColaboradora";
import CadastroColaboradora from "./pages/CadastroColaboradora";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pais" element={<PainelPais />} />
            <Route path="/colaboradora" element={<PainelColaboradora />} />
           <Route path="/" element={<Login />} />
           <Route path="/cadastro-colaboradora" element={<CadastroColaboradora />} />
           </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
