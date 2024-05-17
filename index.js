"use Strict";

//Imports
const express = require("express");
const Database = require("./DatabaseManager");
const Routes = require("./RoutesManager");
const User = require("./User");
const bodyParser = require('body-parser');
const path = require('path');
const templates = require('nunjucks');
const cors = require('cors');
const cookieParser = require('cookie-parser');
//Imports\\


const app = express();

require('dotenv').config();
const port = 3000;


app.use(bodyParser.json());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));


//private void Awake()
//{
    app.use(cors({
      origin: 'http://localhost:4200',
      credentials: true
    }));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.set('views', `./views`);
    app.use(express.static('static'));
    templates.configure('views',
    {
        autoescape: true,
        express: app
    });
    app.set('view engine', 'html');
//}




//Routes

app.get("/", (req, res) => res.send("Express on Vercel"));
app.get("/authentificate", async (request, response) =>
{
    let json = await Routes.Authentificate(request,response);
    response.send(json);
    return;
});


app.post("/addProductToCart", async (request, response) =>
{
    let json = await Routes.AddProductToCart(request,response);
    response.send(json);
    return;
});


app.post("/changeAddress", async (request, response) =>
{
    let json = await Routes.ChangeAddress(request,response);
    response.send(json);
    return;
});

app.post("/changeEmail", async (request, response) =>
{
    let json = await Routes.ChangeEmail(request,response);
    response.send(json);
    return;
});

app.post("/changeUsername", async (request, response) =>
{
    let json = await Routes.ChangeUsername(request,response);
    response.send(json);
    return;
});

app.post("/changeCountCart", async (request, response) =>
{
    let json = await Routes.ChangeCountCart(request,response);
    response.send(json);
    return;
});

app.delete("/deleteAccount", async (request, response) =>
{
    let json = await Routes.DeleteAccount(request,response);
    response.send(json);
    return;
});

app.get("/emailIsAvailable/:email", async (request, response) =>
{
    let email = request.params.email;
    let json = await Routes.EmailIsAvailable(request,response,email);
    response.send(json);
    return;
});

app.post("/login", async (request, response) =>
{
    let json = await Routes.Login(request,response);
    response.send(json);
    return;
});

app.post("/signup", async (request, response) =>
{
    let json = await Routes.Signup(request,response);
    response.send(json);
    return;
});

app.get("/logout", (request, response) =>
{
    let json = Routes.Logout(request,response);
    response.send(json);
    return;
});

app.get("/test", async (request, response) =>
{
    let json = await Routes.Test(request,response);
    response.send(json); 
    return;
});

app.get("/products", async (request, response) =>
{
    let json = await Routes.Products(request,response);
    response.send(json);
    return;
});


app.post("/favorite", async (request, response) =>
{
    let json = await Routes.Favorite(request,response);
    response.send(json);
    return;
});

app.get("/getFavorites", async (request, response) =>
{
    let json = await Routes.GetFavorites(request,response);
    response.send(json);
    return;
});

app.get("/getCart", async (request, response) =>
{
    let json = await Routes.GetCart(request,response);
    response.send(json);
    return;
});

app.get("/priceCart", async (request, response) =>
{
    let json = await Routes.PriceCart(request,response);
    response.send(json);
    return;
});

app.listen(process.env.PORT, () => console.log("Server running!!!"));










