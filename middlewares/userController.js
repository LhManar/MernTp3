
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Utilitaire de génération du token JWT
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// POST /api/users/register
// Inscription d'un nouvel utilisateur
const registerUser = async (req, res) => {
    try {
        const { name, email, password, age, role } = req.body;

        // Vérification des champs obligatoires
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Nom, email et mot de passe requis"
            });
        }

        // Vérification de l'existence de l'utilisateur
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).json({
                message: "Cet email est déjà utilisé"
            });
        }

        // Hachage sécurisé du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création de l'utilisateur
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            age,
            role
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role)
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// POST /api/users/login
// Connexion d'un utilisateur
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérification des champs obligatoires
        if (!email || !password) {
            return res.status(400).json({
                message: "Email et mot de passe requis"
            });
        }

        // Recherche de l'utilisateur
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Identifiants invalides"
            });
        }

        // Comparaison du mot de passe avec le hash enregistré
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Identifiants invalides"
            });
        }

        // Retour des informations et du token
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role)
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// GET /api/users/profile
// Récupération du profil de l'utilisateur connecté
const getUserProfile = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// GET /api/users
// Récupération de tous les utilisateurs (administrateur uniquement)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json(users);

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers
};
