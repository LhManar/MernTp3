
const User = require("../models/userModel");
const Article = require("../models/articleModel");


const createUser = async (req, res) => {
  try {
    const { name, email, age, role, bio, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Le nom et l'email sont requis"
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé"
      });
    }

    const user = await User.create({
      name,
      email,
      age,
      role,
      bio,
      phone
    });

    return res.status(201).json(user);

  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: err.message });
  }
};


const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

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

    return res.status(500).json({
      message: err.message
    });
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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  deleteUser
};
