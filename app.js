const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.set("strictQuery" , true);
mongoose.connect("mongodb+srv://admin-Abdullah:MR.StarkHero1997@cluster0.5bvbpvu.mongodb.net/todolistDB");


const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item" , itemsSchema);
 const item1 = new Item({
   name : "Welcome to your to do list"
 });
 const item2 = new Item({
    name : "Hit the + to add a new item"
 });
 const item3 = new Item({
    name : "<-- Hit this to delete an item"
 });

 const defultItems = [item1 , item2 , item3];

 const listSchema = {
  name : String,
  items : [itemsSchema]
 };

 const List = mongoose.model("List" , listSchema);




app.get("/", function(req, res) {

   Item.find({} ,function(err , docs){

    if(defultItems === 0){
      Item.insertMany(defultItems , function(err , docs){
        if(err){
          console.log(err);
        }else{
          console.log("successfullly created");
        }
       });  
       res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: docs});
    }     
   });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;



  const item = new Item({
    name : itemName
  });



  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  
  
     else{
    List.findOne({name : listName} , function(err , foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete" , function(req , res){
  const checkedBox = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedBox , function(err){
      if(!err){
        console.log(checkedBox + "has successfully removed");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name : listName} , {$pull : { items : {_id :checkedBox }}} , function(err , foundList){
      if(!err){
         res.redirect("/" + listName);
      }
    });
  }


 
});


app.get("/:customName" , function(req , res){
  const costumListName = _.capitalize(req.params.customName);
  List.findOne({name : costumListName} , function(err, foundList){
    if(!err){
      if(!foundList){

        const list = new List({
          name : costumListName , 
          items : defultItems
        })
        list.save();
        res.redirect("/" + costumListName);

      }else{
        res.render("list" , {listTitle: foundList.name , newListItems: foundList.items} );
      }
    }
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
