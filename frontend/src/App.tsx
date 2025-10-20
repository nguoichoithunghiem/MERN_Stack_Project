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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<MainLayout><ProductList /></MainLayout>}
        />
        <Route
          path="/products"
          element={<MainLayout><ProductList /></MainLayout>}
        />
        <Route
          path="/users"
          element={<MainLayout><UserList /></MainLayout>}
        />
        <Route
          path="/orders"
          element={<MainLayout><OrderList /></MainLayout>}
        />
        <Route
          path="/brands"
          element={<MainLayout><BrandList /></MainLayout>}
        />
        <Route
          path="/categories"
          element={<MainLayout><CategoryList /></MainLayout>}
        />
        <Route
          path="/shippings"
          element={<MainLayout><ShippingList /></MainLayout>}
        />
        <Route
          path="/paymentMethods"
          element={<MainLayout><PaymentMethodList /></MainLayout>}
        />
        <Route path="/login"
          element={<Login />} />
        <Route
          path="/revenue"
          element={<MainLayout><RevenueView /></MainLayout>}
        />
      </Routes>

    </Router>
  );
};

export default App;
