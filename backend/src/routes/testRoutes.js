import express from "express";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

const mockUser = (role) => {
  return (req, res, next) => {
    req.user = { 
      uid: "test--user-123",
      role: role
    };

    next();
  };
};

router.get(
  "/admin",
  mockUser("Admin"),
  authorizeRole("Admin"),
  (req, res) => {
    res.json({ message: "Welcome, Admin!"});
  }
);

router.get(
  "/staff",
  mockUser("Staff"),
  authorizeRole("Admin"),
  (req, res) => {
    res.json({ message: "Welcome, Admin!"});
  }
);

router.get(
  "/no-user",
  (req, res, next) => {
    next();
  },
  authorizeRole("Admin"),
  (req, res, next) => {
    res.json({ message: "Welcome, Admin!"});
  }
);

router.get(
  "/no-role",
  mockUser(undefined),
  authorizeRole("Admin"),
  (req, res) => {
    res.json({ message: "Welcome, Admin!"});
  }
);

router.get(
  "/unexpected-role",
  mockUser("Manager"),
  authorizeRole("Admin"),
  (req,res) => {
    res.json({ message: "Welcome, Admin!"});
  }
);

router.get(
  "/staff-only",
  mockUser("Staff"),
  authorizeRole("Staff"),
  (req, res) => {
    res.json({ message: "Welcome, Staff!"});
  }
);

router.get(
  "/shared",
  mockUser("Staff"),
  authorizeRole("Admin", "Staff"),
  (req, res) => {
    res.json({ message: "Access granted!" });
  }
);

export default router; 