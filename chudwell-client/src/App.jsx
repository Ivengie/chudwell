import { HashRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LibraryProvider } from "./context/LibraryContext.jsx";
import { ModalProvider } from "./context/ModalContext.jsx";
import Layout from "./components/Layout.jsx";
import RequireRole from "./components/RequireRole.jsx";
import HomePage from "./pages/HomePage.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import AdvancedSearchPage from "./pages/AdvancedSearchPage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import ShelvesPage from "./pages/ShelvesPage.jsx";
import ReaderPage from "./pages/ReaderPage.jsx";
import StudioPage from "./pages/StudioPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";


export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <LibraryProvider>
          <ModalProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/advanced-search" element={<AdvancedSearchPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/shelves" element={<RequireRole allow={["reader", "writer"]}><ShelvesPage /></RequireRole>} />
                <Route path="/read/:bookId/:chapter?" element={<ReaderPage />} />
                <Route path="/studio/:type/:bookId" element={<RequireRole allow={["writer"]}><StudioPage /></RequireRole>} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ModalProvider>
        </LibraryProvider>
      </AuthProvider>
    </HashRouter>
  );
}
