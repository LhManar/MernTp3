const express = require("express");
const  articleController = require("../controllers/articleController");
const routes = express.Router();

routes.get("/", articleController.getAllArticles);
routes.get("/:id", articleController.getArticleById);
routes.put('/:id', articleController.updateArticle);
routes.post('/', articleController.createArticle);
routes.delete('/:id', articleController.deleteArticle);

module.exports = routes;