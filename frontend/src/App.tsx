import { Index } from "./pages/Index"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Repositories from "./pages/Repositories";
import Layout from "./components/templates/Layout";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route element={<Layout />}>
          <Route path="/repositories" element={<Repositories />} />
        </Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App
