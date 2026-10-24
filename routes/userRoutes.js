const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updatePassword,
    updateUserRole
} = require("../controllers/userController");

const {
    protect,
    adminOnly
} = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/update-password", protect, updatePassword);
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.get("/", protect, adminOnly, getAllUsers);

module.exports = router;