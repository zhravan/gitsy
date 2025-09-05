import { Index } from "./pages/Index"
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/repositories" element={<Index />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
