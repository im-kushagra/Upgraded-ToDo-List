//jshint esversion:6

const express = require("express");
const bodyparser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();



app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const first = new Item({
    name: "Coding"
});

const sec = new Item({
    name: "Web-Dev"
});

const third = new Item({
    name: "LeetCode"
});

const itemsArray = [first,sec,third];

const listSchema = {
    name: String,
    items: [itemsSchema]

};

const List=mongoose.model("List",listSchema);

app.get("/", function (req, res) {

    var day = date();

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(itemsArray, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully Achieved");
                }
            })
            res.redirect("/");
        }

        if (err) {
            console.log(err);
        } else {
            res.render("lists", {
                listTitle: day,
                newListItem: foundItems
            });
        }

    })



})

app.get("/:work", function (req, res) {
    const listName = _.capitalize(req.params.work);

    List.findOne({name:listName},function(err,foundList){
        if(!err){
           if(!foundList){
            const list=new List({
                name:listName,
                items: itemsArray
            });
        
            list.save();
            res.redirect("/"+listName);
           }
        
        else{
            res.render("lists",{
                listTitle: foundList.name,
                newListItem: foundList.items
            });
        }
    }
    });

    
   
})


app.post("/", function (req, res) {
    const itemName = req.body.newitem;
    const listName=req.body.list;   

    const item = new Item({
        name: itemName
    });

    if(listName==date()){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

    
});

app.post("/work", function (req, res) {
    let item = req.body.newitem;
    workItems.push(item);
    res.redirect("/work");
})

app.post("/delete", function (req, res) {
    const itemDelete = req.body.checkbox;
    const listName=req.body.listName;

    if(listName===date()){

        Item.deleteOne({
            _id: itemDelete
        }, function (err) {
            if (!err) {
                console.log("Succesfully Deleted");
    
            }
            res.redirect("/");
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemDelete}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }

})


app.listen(3000, function () {
    console.log("Server is running on Port 3000");
})