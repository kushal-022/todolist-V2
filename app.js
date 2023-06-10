//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
// }

mongoose.connect('mongodb+srv://kushal:kushal123@cluster0.adbjq36.mongodb.net/todolistDB');

const itemSchema = new mongoose.Schema({
  name: String
});


const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to our todo list app! Stay organized and productive by managing your tasks efficiently."
});

const item2 = new Item({
  name: "Hit the + Button to do add a new Task :) "
});

const item3 = new Item({
  name: "Click on the checkbox when u have completed the Task to delete it :) "
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = new mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find().then(function(items) {
    if(items.length === 0){
      Item.insertMany(defaultItems).then(x=> console.log(x));
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});



app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then(foundList => {
    if (!foundList) {
      // Creating a new List .
      const list = new List({
        name: customListName,
        items: defaultItems
      }); 
      list.save();
      res.redirect("/"+ customListName);
    }
    else {
      // Show the existing List .
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  });


});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  console.log(listName);

  const newItem  = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then(foundList => {
      foundList.items.push(newItem);
      foundList.save();
    });
    res.redirect("/"+listName);
  }

});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id: id}).then(x=> console.log(x));
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}).then(x => {
      res.redirect("/"+ listName);
    });
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
