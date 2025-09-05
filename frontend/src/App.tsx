import { Index } from "./pages/Index"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Repositories from "./pages/Repositories";
import Layout from "./components/templates/Layout";
import Profile from "./pages/Profile";
import Repository from "./pages/Repository";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route element={<Layout />}>
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/repository/:owner/:repo" element={<Repository />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
