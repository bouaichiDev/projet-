import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { MainLayout } from "../layout/MainLayout";
import { Connexion } from "../pages/Connexion";
import { Inscription } from "../pages/Inscription";
import { TableauDeBord } from "../pages/TableauDeBord";
import { Depenses } from "../pages/Depenses";
import { Categories } from "../pages/Categories";
import { BudgetPage } from "../pages/Budget";
import { Statistiques } from "../pages/Statistiques";
import { Profil } from "../pages/Profil";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Connexion />} />
        <Route path="/register" element={<Inscription />} />

        {/* Guarded Dashboard Layout Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<TableauDeBord />} />
            <Route path="/depenses" element={<Depenses />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/profil" element={<Profil />} />
          </Route>
        </Route>

        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoutes;
