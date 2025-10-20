// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./pages/ProductsPage/ProductList";
import UserList from "./pages/UsersPage/UserList";
import OrderList from "./pages/OrdersPage/OrderList";
import MainLayout from "./Layout/MainLayout";
import BrandList from "./pages/Brands/BrandList";
import CategoryList from "./pages/Categories/CategoryList";
import ShippingList from "./pages/Shippings/ShippingList";
import PaymentMethodList from "./pages/PaymentMethods/PaymentMethodList";
import Login from "./pages/Login/Login";
import RevenueView from "./pages/Revenue/RevenueView";
import PrivateRoute from "./components/PrivateRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Private routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout><ProductList /></MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <MainLayout><ProductList /></MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <MainLayout><UserList /></MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <MainLayout><OrderList /></MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/brands"
          element={
            <PrivateRoute>
              <MainLayout><BrandList /></MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <MainLayout><CategoryList /></MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/shippings"
          element={
            <PrivateRoute>
              <MainLayout><ShippingList /></MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/paymentMethods"
          element={
            <PrivateRoute>
              <MainLayout><PaymentMethodList /></MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/revenue"
          element={
            <PrivateRoute>
              <MainLayout><RevenueView /></MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
