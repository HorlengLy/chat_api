const mongoose = require('mongoose')

const connectDb = async ()=>{
    try{
        await mongoose.connect(process.env.DB_URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
          })
        .then(()=>{
            console.log("database connected successfully");
        })

    }catch(error){
        console.error({error});
    }
}

connectDb()