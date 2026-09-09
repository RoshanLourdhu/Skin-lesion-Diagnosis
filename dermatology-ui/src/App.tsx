import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MobileUpload from "./pages/MobileUpload";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/mobile-upload/:sessionId" element={<MobileUpload />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}