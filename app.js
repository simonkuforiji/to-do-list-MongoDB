const express = require("express");
const bodyParser = require("body-parser");
const dateModule = require(__dirname + "/dateModule.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Simon:N8pzlArvtoWhcTN9@cluster0.6ntr2.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = new mongoose.Schema({
    name: String
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Here's Today's List"
});
const item2 = new Item({
    name: "< Check an Item to Remove"
});

let dbDocumentArray = [item1, item2];

const todaysDate = dateModule.getDate();

app.get("/", function(req, res){

    Item.find({}, function(err, foundArray){
        if(!err){
            if(foundArray.length === 0){
                Item.insertMany(dbDocumentArray, function(err){
                    if(!err){
                        console.log("Successfully saved items1-3 to todolistDB");
                        res.redirect("/");
                    } else{
                        console.log(err);
                    }
                });
            } else{
                res.render("list", {listTitleLarge: todaysDate, listTitle: todaysDate, newListItems: foundArray});
            }
        } else{
            console.log(err);
        }
    });
});

app.get("/:ListNameParam", function(req, res){
    const customListName = req.params.ListNameParam;

    List.findOne({name: customListName}, function(err, foundObject){
        if(!err){
            if(!foundObject){
                const customList = new List({
                    name: customListName,
                    items: dbDocumentArray
                });
                customList.save();
                res.redirect("/" + customListName); //refresh to reflect change and stay in same page
            } else{
                //since it already exists, just render it
                res.render("list", {listTitleLarge: _.capitalize(foundObject.name), listTitle: foundObject.name, newListItems: foundObject.items}); //just better to use foundObject.name instead of custonListname
            }
        } else{
            console.log(err);
        }
    });
});

app.get("/about", function(req, res){
    res.render("about", {todaysDateWithYear: dateModule.getDateWithYear()});
})

app.post("/", function(req, res){
    const otherItem = req.body.newItem; //new item
    const listName = req.body.currentList;  //title of list gotten from submit button

    //item schema for new item
    const nthItem = new Item({
        name: otherItem
    });

    if(listName === todaysDate){    
        nthItem.save(); //save to items collection since the page picks stuff from items collection
        res.redirect("/");  //refresh the same page youre on to reflect new added item
    } else{
        List.findOne({name: listName}, function(err, foundObject){
            if(!err){
                foundObject.items.push(nthItem);    //add new item into list items array
                foundObject.save();
                res.redirect("/" + listName);   //refresh but stay on the same list page
            } else{
                console.log(err);
            }
        });
    }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox; //_id of checked item
    const listName = req.body.listName;    //name of list
    console.log("listtitle: " + listName);

    if(listName === todaysDate){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("successfully deleted");
                res.redirect("/");
            } else{
                console.log(err);
            }
        });
    } else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err){
            if(!err){
                console.log("Successfully removed item");
                res.redirect("/" + listName);
            } else{
                console.log(err);
            }
        })
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
    console.log(`Listening on port ${port}`);
});