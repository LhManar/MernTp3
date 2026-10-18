const mongoose= require('mongoose');
async function connect_db(uri){
    if(!uri){
        throw new Error("uri mongodb est manquant dans les variable");
    }
    await mongoose.connect(uri,{
        autoIndex:true
    });
    console.log('connexion a mongoDB reussie!')
}
module.exports=connect_db;