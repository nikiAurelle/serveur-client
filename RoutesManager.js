const { ObjectId } = require("mongodb");
const Database = require("./DatabaseManager");
const User = require("./User");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

class RoutesManager
{
    static async Authentificate(request,response)
    {
        const cookies = request.cookies;
        let user = await User.Authentificate(cookies.session);
        let json =
        {
            success: false,
            errors: "",
            user: user
        };
        if (user != null)
        {
            json.success = true;
        }
        else
        {
            json.success = false;
            json.errors += "Votre session a expiré, veuillez vous connectez à nouveau.";
        }
        return json;
    }

    static async AddProductToCart(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
        };
        let idProduct = request.body.id;
        if(idProduct == "" || undefined || null)
        {
            json.success = false;
            json.errors += "Un problème est survenu<br>";
            return json;
        }
        let authUser = await User.Authentificate(request.cookies.session);
        if(authUser == null)
        {
            json.success = false;
            json.errors += "Un problème d'authentification est survenu<br>";
            return json;
        }
        await User.SetCartProduct(authUser._id,idProduct);
        json.success = true;
        return json;
    }


    static async ChangeAddress(request,response)
    {
        let json =
        {
            success: true,
            errors: ""
        };

        var postData = request.body;
        let newAddress = postData.address;
        let newPostal = postData.postal;
        let newCity = postData.city;
        let regex = /^\d.*[a-zA-Z]$/;
        if(!regex.test(newAddress) && newAddress != "")
        {
            json.success = false;
            json.errors += "L'adresse est invalide.<br>"
        }
        regex = /[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d/;
        if(!regex.test(newPostal) && newPostal != "")
        {
            json.success = false;
            json.errors += "Le code postal est invalide.<br>"
        }
        regex = /^[a-zA-Z]+$/;
        if(!regex.test(newCity) && newCity != "")
        {
            json.success = false;
            json.errors += "La ville n'existe pas.<br>"
        }
        if(!json.success)
        {
            return json;
        }
        let authUser = await User.Authentificate(request.cookies.session);
        if(authUser == null)
        {
            json.success = false;
            json.errors += "Un problème est survenu<br>";
            return json;
        }
        await Database.Update("User",{_id:authUser._id},{ address: postData });
        json.success = true;

        return json;
    }

    static async ChangeEmail(request,response)
    {
        let json =
        {
            success: false,
            errors: ""
        };

        var postData = request.body;
        let newEmail = postData.email;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(regex.test(newEmail))
        {
            let authUser = await User.Authentificate(request.cookies.session);
            if(authUser == null)
            {
                json.success = false;
                json.errors += "Un problème est survenu<br>";
                return json;
            }
            let available = await User.EmailIsAvailable(newEmail);
            if(!available)
            {
                json.success = false;
                json.errors += "L'adresse courriel n'est pas disponible<br>";
                return json;
            }
            await Database.Update("User",{_id:authUser._id},{ email: newEmail });
            json.success = true;
        }
        else
        {
            json.success = false;
            json.errors += "L'email est invalide.";
        }
        return json;
    }

    static async ChangeUsername(request,response)
    {
        let json =
        {
            success: false,
            errors: ""
        };

        var postData = request.body;
        let newUsername = postData.username;
        if(newUsername.length >= 3)
        {
            let authUser = await User.Authentificate(request.cookies.session);
            if(authUser == null)
            {
                json.success = false;
                json.errors += "Un problème est survenu<br>";
                return json;
            }
            await Database.Update("User",{_id:authUser._id},{ username: newUsername });
            json.success = true;
        }
        else
        {
            json.success = false;
            json.errors += "Le nom d'utilisateur est invalide.";
        }
        return json;
    }


    static async ChangeCountCart(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
        };
       
        let authUser = await User.Authentificate(request.cookies.session);
        if(authUser == null)
        {
            json.success = false;
            json.errors += "Un problème d'authentification est survenu<br>";
            return json;
        }
        await User.SetCountCart(authUser._id,request.body.id,request.body.count);
        json.success = true;
        return json;
    }

    static async DeleteAccount(request,response)
    {
        let json =
        {
            success: false,
            errors: ""
        };
        let user = await User.Authentificate(request.cookies.session);
        if(user != null)
        {
            json.success = true;
            await Database.Delete("User",{_id:user._id});
        }
        else
        {
            json.success = false;
            json.errors = "La suppression ne c'est pas terminée. Le compte est peut-être déja supprimer ou le cookie de session était invalide."
        }
        return json;
    }

    static async Login(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
            user: null,
            cookie: null
        };
        var postData = request.body;
        var email = postData.email;
        var password = postData.password;
        let user = await User.Login(email,password);
        if(user != null)
        {
            json.success = true;
            json.user = user;
            json.cookie = await User.CreateSession(user);
        }
        else
        {
            json.success = false;
            json.errors += "L'adresse courriel ou le mot de passe est invalide.";
        }

        return json;
    }

    static Logout(request,response)
    {
        const cookies = request.cookies;
        let json =
        {
            success: false,
            errors: ""
        };
        return json;
    }

    static async EmailIsAvailable(request,response,email)
    {
        let json =
        {
            success: false,
            errors: ""
        };
        json.success = await User.EmailIsAvailable(email);
        return json;
    }

    static async Signup(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
            user:null,
            cookie:""
        };

        var postData = request.body;
        var username = postData.username;
        var email = postData.email;
        var password = postData.password;
        var confirmPassword = postData.confirmPassword;

        let valid = true;
        let form = new Object();
        form.username = username;
        form.email = email;
        form.password = password;
        form.confirmPassword = confirmPassword;

        if (password.length < 8)
        {
            json.errors += "Le mot de passe doit faire au moins 8 caractères.<br>";
            valid = false;
        }
        if (password != confirmPassword)
        {
            json.errors += "Les mots de passes doivent être identique.<br>";
            valid = false;
        }
        let available = await User.EmailIsAvailable(email);
        if  (!available)
        {
            json.errors += "L'adresse courriel n'est pas disponible.<br>";
            valid = false;
        }

        if(valid)
        {
            let hashedPassword = bcrypt.hashSync(password, 0);
            json.success = true;
            let newUser = new User(username,email,hashedPassword);
            await Database.Insert("User",newUser);
            let authUser = await User.Login(email,password);
            let sessionCookie = await User.CreateSession(authUser);
            json.cookie = sessionCookie;
            delete authUser.password;
            delete authUser._id;
            json.user = authUser;
            return json;
        }
        else
        {
            json.success = false;
            RoutesManager.formData = form;
            return json;
        }
    }

    static async Products(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
            products:[]
        };

        let results = await Database.SelectAll('products', 12);
        json.products = results;
        json.success = true;
        return json;
    }

    static async PriceCart(request,response)
    {
        let json = await this.GetCart(request,response)
        json.price = 0;
        for (let i = 0; i < json.cart.length; i++) 
        {
            json.price += json.cart[i].regular_price * json.cart[i].count;
        }
        json.price = json.price.toFixed(2)
        return json;
    }

    static async Favorite(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
        };
        let idFavorite = request.body.id;
        if(idFavorite == "" || undefined || null)
        {
            json.success = false;
            json.errors += "Un problème est survenu<br>";
            return json;
        }
        let authUser = await User.Authentificate(request.cookies.session);
        if(authUser == null)
        {
            json.success = false;
            json.errors += "Un problème d'authentification est survenu<br>";
            return json;
        }
        await User.SetFavorite(authUser._id,idFavorite);
        json.success = true;
        return json;
    }

    static async Test(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
        };
        return json; 
    }

    static async GetFavorites(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
            favorites:[]
        };

        let authUser = await User.Authentificate(request.cookies.session);
        if(authUser == null)
        {
            json.success = false;
            json.errors += "Un problème d'authentification est survenu<br>";
            return json;
        }
        let favId = [];
        for (let favorite of authUser.favorite)
        {
            favId.push(new ObjectId(favorite));
        }
        let favoriteProducts = await Database.Select("products", { _id: { $in: favId } });
       
        json.favorites = favoriteProducts;
        json.success = true;
        return json;
    }

    static async GetCart(request,response)
    {
        let json =
        {
            success: false,
            errors: "",
            cart:[]
        };

        let authUser = await User.Authentificate(request.cookies.session);
        if(authUser == null)
        {
            json.success = false;
            json.errors += "Un problème d'authentification est survenu<br>";
            return json;
        }
        let products = [];
        for (let product of authUser.cart)
        {
            products.push(new ObjectId(product._id));
        }
        let cartProducts = await Database.Select("products", { _id: { $in: products } });
        for (let i = 0; i < cartProducts.length; i++) 
        {
            cartProducts[i].count = authUser.cart[i].count;
        }
        json.cart = cartProducts;
        json.success = true;
        return json;
    }
}

   

module.exports = RoutesManager;
