
const express = require("express");
const dotenv = require("dotenv");
const connect_db = require("./config/db");

const articleRoutes = require("./routes/articleRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour lire le JSON
app.use(express.json());

// Route d'accueil
app.get("/", (req, res) => {
    res.json({ message: "Hello, World!" });
});

// Routes API
app.use("/api/articles", articleRoutes);
app.use("/api/users", userRoutes);

// Route About
app.get("/about", (req, res) => {
    res.json({
        application: "Mon API",
        name: "Oumayma Bayar",
        version: "1.0.0"
    });
});

// Route Contact
app.post("/contact", (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({
            message: "Les champs email et message sont obligatoires"
        });
    }

    return res.status(200).json({
        message: "Merci, votre message a bien été reçu"
    });
});

// Connexion MongoDB et démarrage du serveur
const startServer = async () => {
    try {
        await connect_db(process.env.MONGODB_URI);

        app.listen(PORT, () => {
            console.log(
                `Serveur MERN en écoute sur http://localhost:${PORT}`
            );
        });
    } catch (err) {
        console.error(
            "Erreur critique du serveur :",
            err.message
        );
        process.exit(1);
    }
};

startServer();
