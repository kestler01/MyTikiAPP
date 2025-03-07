/////////////////////////////////////////////
// Import Our Dependencies
/////////////////////////////////////////////
const express = require("express") // import express
const TikiDrink = require("../models/tikiDrink")
/////////////////////////////////////////
// Create Route
/////////////////////////////////////////
const router = express.Router()

/////////////////////////////////////////////
// ROUTES
/////////////////////////////////////////////

// GET request
///index for all tikiDrink route
router.get("/", (req, res) => {
    const loggedIn = req.session.loggedIn
    if(loggedIn){
    TikiDrink.find({ owner: null })
        .populate("comments.author", "username")
        .then(tikiDrink => {
            const username = req.session.username
            const loggedIn = req.session.loggedIn
            const userId = req.session.userId
            
            res.render('tikiDrink/index', { tikiDrink, username, loggedIn, userId})
        })
        .catch(err => res.redirect(`/error?error=${err}`))
    }else{
        res.redirect(`/error?error=must%20log%20in%20to%20continue`)
    }
})

// GET for new tikiDrinks
// renders the form to create new a drink
router.get('/new', (req, res) => {
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    const userId = req.session.userId
    if(loggedIn){
    res.render('tikiDrink/new', { username, loggedIn, userId })
    }else{
        res.redirect(`/error?error=must%20log%20in%20to%20continue`)
    }
})

// POST request
// create route -> gives the ability to create new drinks
router.post("/", (req, res) => {
    req.body.fav = req.body.fav === 'on' ? true : false
    req.body.owner = req.session.userId
    const ingredArr = req.body.ingredients.split(",")
    req.body.ingredients = ingredArr
    const garnishArr = req.body.garnishes.split(",")
    req.body.garnishes = garnishArr
    const prepArr = req.body.prepInstructs.split(",")
    req.body.prepInstructs = prepArr
    TikiDrink.create(req.body)
        .then(tikiDrink=> {
            res.redirect('/tikiDrink')
        })
        .catch(err => res.redirect(`/error?error=${err}`))
})

// GET request
// only drinks owned by logged in user
router.get('/mine', (req, res) => {
    // find the drinks, by ownership
    const loggedIn = req.session.loggedIn
    if(loggedIn){
    TikiDrink.find({ owner: req.session.userId })
        .then(tikiDrink => {
            const username = req.session.username
            const loggedIn = req.session.loggedIn
            const userId = req.session.userId
            if (req.session.loggedIn) {
            res.render('tikiDrink/index', { tikiDrink, username, loggedIn, userId })
            } else{
                res.redirect(`/error?error=must%20log%20in%20to%20continue`)
            }
        })
        .catch(err => res.redirect(`/error?error=${err}`))
    } else {
        res.redirect(`/error?error=must%20log%20in%20to%20continue`)
    }
})

// GET request
// only drinks FAVORITED by user
router.get('/favs', (req, res) => {
    // find the drinks, by favorship
    const loggedIn = req.session.loggedIn
    if(loggedIn){
    TikiDrink.find({ fav: true, owner: req.session.userId })
        .then(tikiDrink => {
            const username = req.session.username
            const loggedIn = req.session.loggedIn
            const userId = req.session.userId
            res.render('tikiDrink/index', { tikiDrink, username, loggedIn, userId })
        })
        .catch(err => res.redirect(`/error?error=${err}`))
    }else{
        res.redirect(`/error?error=must%20log%20in%20to%20continue`)
    }
})

// FAVS PUT request
// update route -> updates a specific drink
router.put("/fav/:id", (req, res) => {
    const id = req.params.id
     req.body.fav = req.body.fav === 'on' ? true : false
    TikiDrink.findById(id)
        .then(tikiDrink => {
            return tikiDrink.updateOne(req.body)
        })
        .then(() => {
            res.redirect(`/tikiDrink/${id}`)
        })
        .catch(err => res.redirect(`/error?error=${err}`))
})

// GET request to show the update page
router.get("/edit/:id", (req, res) => {
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    const userId = req.session.userId
    const tikiDrinkId = req.params.id
    if(loggedIn){
    TikiDrink.findById(tikiDrinkId)
    .populate("comments.author", "username")
        // render the edit form if there is a drink
        //this will join all items in the arrays and add a comma
        //in between them
        .then(tikiDrink => {
            let ingredientString = ""
            for(let i = 0; i < tikiDrink.ingredients.length; i ++){
                if(i == tikiDrink.ingredients.length - 1){
                    ingredientString += tikiDrink.ingredients[i]
                } else {
                    ingredientString += tikiDrink.ingredients[i] + ","
                }    
            }
            let garnishString = ""
            for(let i = 0; i < tikiDrink.garnishes.length; i ++){
                if(i == tikiDrink.garnishes.length - 1){
                    garnishString += tikiDrink.garnishes[i]
                } else {
                    garnishString += tikiDrink.garnishes[i] + ","
                }
            }
            let prepInstructString = ""
            for(let i = 0; i < tikiDrink.prepInstructs.length; i ++){
                if(i == tikiDrink.prepInstructs.length - 1){
                    prepInstructString += tikiDrink.prepInstructs[i]
                } else {
                    prepInstructString += tikiDrink.prepInstructs[i] + ","
                }   
            }
            res.render('tikiDrink/edit', { tikiDrink, username, loggedIn, userId, ingredientString, garnishString, prepInstructString })
        })
        .catch(err => {
            res.redirect(`/error?error=${err}`)
        })
    }else{
        res.redirect(`/error?error=must%20log%20in%20to%20continue`)
    }
})

//PUT request
//update route -> updates a specific drink
router.put("/:id", (req, res) => {
    console.log("req.body initially", req.body)
    const id = req.params.id
    const loggedIn = req.session.loggedIn
    req.body.fav = req.body.fav === 'on' ? true : false
    req.body.owner = req.session.userId
    //this will split each string at every comma
    const ingredArr = req.body.ingredients.split(",")
    req.body.ingredients = ingredArr
    const garnishArr = req.body.garnishes.split(",")
    req.body.garnishes = garnishArr
    const prepArr = req.body.prepInstructs.split(",")
    req.body.prepInstructs = prepArr
    console.log('req.body after changing checkbox value', req.body)
    if(loggedIn){
    TikiDrink.findById(id)
        .then(tikiDrink => {
            if (tikiDrink.owner == req.session.userId) {
                return tikiDrink.updateOne(req.body)
                
            } else {
                res.sendStatus(401)
            }
        })
        .then(() => {
            res.redirect(`/tikiDrink/${id}`)
            
            console.log(id)
        })
        .catch(err => res.redirect(`/error?error=${err}`))
    }else{
        res.redirect(`/error?error=must%20log%20in%20to%20continue`)
    }
})

// GET request to show the customize page
router.get("/customize/:id", (req, res) => {
    const username = req.session.username
    const loggedIn = req.session.loggedIn
    const userId = req.session.userId
    const tikiDrinkId = req.params.id
    
    TikiDrink.findById(tikiDrinkId)
        // render the edit form if there is a drink
        .then(tikiDrink => {

    let ingredientString = ""
    for(let i = 0; i < tikiDrink.ingredients.length; i ++){
        if(i == tikiDrink.ingredients.length - 1){
            ingredientString += tikiDrink.ingredients[i]
        } else {
            ingredientString += tikiDrink.ingredients[i] + ","
        }
    }
    let garnishString = ""
    for(let i = 0; i < tikiDrink.garnishes.length; i ++){
        if(i == tikiDrink.garnishes.length - 1){
            garnishString += tikiDrink.garnishes[i]
        } else {
            garnishString += tikiDrink.garnishes[i] + ","
        }   
    }
    let prepInstructString = ""
    for(let i = 0; i < tikiDrink.prepInstructs.length; i ++){
        if(i == tikiDrink.prepInstructs.length - 1){
            prepInstructString += tikiDrink.prepInstructs[i]
        } else {
            prepInstructString += tikiDrink.prepInstructs[i] + ","
        }
    }
            res.render('tikiDrink/customize', { tikiDrink, username, loggedIn, userId, ingredientString, garnishString, prepInstructString })
        })
        .catch(err => {
            res.redirect(`/error?error=${err}`)
        })
})

///// DELETE Request
router.delete('/:id', (req, res) => {
    const tikiDrinkId = req.params.id
    // delete and REDIRECT
    TikiDrink.findByIdAndRemove(tikiDrinkId)
        .then(tikiDrink => {
            res.redirect('/tikiDrink/mine')
        })
        .catch(err => {
            res.redirect(`/error?error=${err}`)
        })
})

// SHOW request
// read route -> finds and displays a single resource
router.get("/:id", (req, res) => {
    const id = req.params.id
    TikiDrink.findById(id)
        .populate("comments.author", "username")
        
        .then(tikiDrink => {
            const username = req.session.username
            const loggedIn = req.session.loggedIn
            const userId = req.session.userId

            res.render('tikiDrink/show', { tikiDrink, username, loggedIn, userId })
        })
        .catch(err => res.redirect(`/error?error=${err}`))
})

/////GET ROUTE for DRINK DELETE CONFIRMATION
router.get("/deleteConf/:id", (req, res) => {
    const id = req.params.id
    TikiDrink.findById(id)
        .populate("comments.author", "username")
        
        .then(tikiDrink => {
            const username = req.session.username
            const loggedIn = req.session.loggedIn
            const userId = req.session.userId

            res.render('tikiDrink/deleteConf', { tikiDrink, username, loggedIn, userId })
        })
        .catch(err => res.redirect(`/error?error=${err}`))
})

//////////////////////////////////////////
// Export the Router
//////////////////////////////////////////
module.exports = router