
const Article = require("../models/articleModel");

// POST /api/articles
// Création d'un article (route protégée)
const createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;

        // Vérification des champs obligatoires
        if (!title || !content) {
            return res.status(400).json({
                message: "Titre et contenu obligatoires"
            });
        }

        // L'auteur est extrait de l'utilisateur authentifié
        const newArticle = await Article.create({
            title,
            content,
            author: req.user._id
        });

        // Récupération des informations de l'auteur
        const populated = await newArticle.populate(
            "author",
            "name email role"
        );

        return res.status(201).json(populated);

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// PUT /api/articles/:id
// Modification d'un article (auteur ou administrateur)
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: "Article non trouvé"
            });
        }

        // Vérification des droits de propriété
        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Action interdite : vous n'êtes pas l'auteur de cet article"
            });
        }

        // Mise à jour des champs
        article.title = req.body.title || article.title;
        article.content = req.body.content || article.content;

        const updated = await article.save();

        // Récupération des informations de l'auteur
        const populated = await updated.populate(
            "author",
            "name email role"
        );

        return res.status(200).json(populated);

    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({
                message: "Identifiant invalide"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// DELETE /api/articles/:id
// Suppression d'un article (auteur ou administrateur)
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: "Article non trouvé"
            });
        }

        // Vérification des droits de propriété
        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Action interdite : vous n'êtes pas l'auteur de cet article"
            });
        }

        // Suppression de l'article
        await Article.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Article supprimé avec succès",
            id: req.params.id
        });

    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({
                message: "Identifiant invalide"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({
      author: req.user._id
    });

    return res.status(200).json(articles);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la récupération des articles",
      error: error.message
    });
  }
};
// Exportation des contrôleurs
module.exports = {
    createArticle,
    updateArticle,
    deleteArticle,
    getMyArticles 
};
