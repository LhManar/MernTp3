const express = require("express");
const dotenv = require('dotenv');
const connect_db = require('./config/db')
const articleRoutes = require("./routes/articleRoutes");
const userRoutes = require("./routes/userRoutes");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Hello, World!" });
});


app.use("/api/articles", articleRoutes);

app.use("/api/users", userRoutes);



app.get("/about", (req, res) => {
    res.json({
        application: "Mon API",
        name: "Oumayma Bayar",
        version: "1.0.0"
    });
});





app.post("/contact", (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({
            message: "Les champs email et message sont obligatoires"
        });
    }

    res.status(200).json({
        message: "Merci, votre message a bien été reçu"
    });
});

(async () => {
    try {
        await connect_db(process.env.MONGODB_URI);
    app.listen(PORT,()=>{
        console.log(`server mern en ecoute sur http://localhost:${PORT}`);
    });
    }catch(err){
        console.error('error critique du serveur:',err.message);
        process.exit(1);
    }
})();