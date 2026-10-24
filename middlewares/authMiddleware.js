
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// 1. Protection des routes privées : vérification du JWT
const protect = async (req, res, next) => {
    let token;

    // Vérification de l'en-tête Authorization avec Bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        try {
            // Extraction du token
            token = req.headers.authorization.split(" ")[1];

            // Vérification de la signature du token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // Récupération de l'utilisateur sans son mot de passe
            req.user = await User.findById(decoded.id).select("-password");

            // Vérification de l'existence de l'utilisateur
            if (!req.user) {
                return res.status(401).json({
                    message: "Non autorisé : utilisateur introuvable"
                });
            }

            // Passage au middleware suivant
            return next();

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Votre session a expire, veuillez vous reconnecter"
                });
            }

            return res.status(401).json({
                message: "Non autorisé : token invalide"
            });
        }
    }

    // Aucun token fourni
    return res.status(401).json({
        message: "Non autorisé : aucun token fourni"
    });
};

// 2. Contrôle d'accès basé sur les rôles (RBAC)
// Réservé aux administrateurs
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({
        message: "Accès refusé : droits administrateur requis"
    });
};

// Exportation des middlewares
module.exports = {
    protect,
    adminOnly
};
