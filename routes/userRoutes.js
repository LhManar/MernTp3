
const express = require("express");
const userController = require("../controllers/userController");

const routes = express.Router();

routes.get("/", userController.getUsers);
routes.post("/", userController.createUser);
routes.delete("/:id", userController.deleteUser);
routes.get("/:id", userController.getUserById);

module.exports = routes;
