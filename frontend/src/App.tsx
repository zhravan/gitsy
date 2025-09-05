import { Index } from "./pages/Index"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Repositories from "./pages/Repositories";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/repositories" element={<Repositories />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
