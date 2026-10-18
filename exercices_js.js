const produits = [
    { nom: "Clavier", prix: 45 },
    { nom: "Écran", prix: 320 },
    { nom: "Souris", prix: 25 }
];


const { nom, prix } = produits[0];

console.log(nom, prix);



const souris = produits.find(produit => produit.nom === "Souris");

console.log(souris.prix);



const produitsMoins100 = produits.filter(produit => produit.prix < 100);

console.log(produitsMoins100);



const avecRemise = prix => prix - (prix * 10 / 100);

console.log(avecRemise(320));