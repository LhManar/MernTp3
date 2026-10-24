
const User = require("../models/userModel");
const Article = require("../models/articleModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "1d"
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, bio, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Le nom, l'email et le mot de passe sont requis"
      });
    }

    const safeRole = "user";

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      role: safeRole,
      bio,
      phone
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: userResponse
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "L'email et le mot de passe sont requis"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Mot de passe incorrect"
      });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Les champs oldPassword et newPassword sont requis"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Ancien mot de passe incorrect"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit comporter au moins 6 caractères"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Mot de passe mis à jour avec succès"
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res) => registerUser(req, res);
const getUsers = async (req, res) => getAllUsers(req, res);

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Identifiant de ressource invalide (format ObjectId attendu)"
      });
    }

    return res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Identifiant utilisateur invalide"
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    const article = await Article.findOne({ author: id });

    if (article) {
      return res.status(400).json({
        message: "Impossible de supprimer un utilisateur ayant des articles publies"
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Utilisateur supprimé avec succès"
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Identifiant utilisateur invalide"
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Rôle mis à jour avec succès",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updatePassword,
  updateUserRole,
  createUser,
  getUsers,
  getUserById,
  deleteUser
};