const Database = require("./DatabaseManager");
const bcrypt = require('bcryptjs');
const uuid = require('uuid').v4;

class User
{
    constructor(username, email, password ) 
    {
        this.username = username;
        this.email = email;
        this.password = password;
        this.address = "";
        this.favorite = [];
        this.cart = [];
    }

    static async CreateSession(user)
    {
        let unixTime = new Date().getTime()
        const guid = uuid();
        let session = 
        {
            _id: guid,
            userId: user._id,
            expireDate : unixTime + (1000*60*999)

        };
        await Database.Insert("Session",session);
        return guid;
    }

    static async EmailIsAvailable(email)
    {
        const client = await Database.Connect();
        try 
        {
            const database = client.db();
            const collection = database.collection("User");
            const user = await collection.findOne({ email: email });
            return user == null; 
        } catch (err) 
        {
            console.error(err);
            return false; 
        } finally 
        {
            await client.close();
        }
    }
    
    static async Login(email,password)
    {
        const client = await Database.Connect();
        try 
        {
            const database = client.db();
            const collection = database.collection("User");
            const user = await collection.findOne({ email: email });
            if (user != null)
            {
                let passwordMatch = bcrypt.compareSync(password,user.password);
                if (passwordMatch)
                {           
                    return user;
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        } catch (err) 
        {
            console.error(err);
            return null; 
        } finally 
        {
            await client.close();
        }
    }
    
    static async Authentificate(sessionCookie)
    {
        const client = await Database.Connect();
        try 
        {
            const database = client.db();
            let collection = database.collection("Session");
            let session = await collection.findOne({ _id: sessionCookie });
            let unixTime = new Date().getTime()
            if(session == null)
            {
                return null;
            }
            if(unixTime > session.expireDate)
            {
                await collection.deleteOne({_id: sessionCookie});
                return null;
            }

            collection = database.collection("User");
            let user = await collection.findOne({ _id: session.userId });  
            delete user.password;
            return user;
        } catch (err) 
        {
            console.error(err);
            return null; 
        } finally 
        {
            await client.close();
        }
    }

    static async SetFavorite(idUser, idFavorite) 
    {
        const client = await Database.Connect();
        try 
        {
            const database = client.db();
            const collection = database.collection("User");
            const isAlreadyFav = await collection.findOne({_id: idUser, favorite: idFavorite});
            if (isAlreadyFav != null) 
            {
                await collection.updateOne({_id: idUser}, { $pull: {favorite: idFavorite} });
            } 
            else 
            {
                await collection.updateOne({_id: idUser}, { $push: {favorite: idFavorite} });
            }
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }
    static async SetCartProduct(idUser, idProduct) 
    {
        const client = await Database.Connect();
        try 
        {
            const database = client.db();
            const collection = database.collection("User");
            const isAlreadyInCart = await collection.findOne({ _id: idUser, cart: { $elemMatch: { _id: idProduct } } });

            if (isAlreadyInCart != null) 
            {
                await collection.updateOne({ _id: idUser }, { $pull: { cart: { _id: idProduct } } });
            } 
            else 
            {
                let cartProduct = 
                {
                    _id : idProduct,
                    count : 1
                }
                await collection.updateOne({_id: idUser}, { $push: {cart: cartProduct} });
            }
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }

    static async SetCountCart(idUser, idProduct,count) 
    {
        const client = await Database.Connect();
        try 
        {
            const database = client.db();
            const collection = database.collection("User"); 
            await collection.updateOne({_id: idUser, "cart._id": idProduct }, { $set: {"cart.$.count": count }});
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }
}
module.exports = User;