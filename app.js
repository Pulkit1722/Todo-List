//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose =require("mongoose");
const app = express();
const _= require("lodash");
app.set('view engine', 'ejs');
const { Schema } = mongoose;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// set up a custom MongoDB 
mongoose.connect('', {useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false}  );


const itemSchema= new Schema({
  name:String
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"this"
});
const item2 = new Item({
  name:'hit the plus button'
});
const item3 = new Item({
  name:'hit this checkbox'
});
const defaultItems = [item1,item2,item3];

const listSchema= ({
  name: String,
  items:[itemSchema]
});
const List = mongoose.model("list",listSchema);



app.get("/", function(req, res) {
const day = date.getDate();

Item.find({},function(err,foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultItems, function(error) {
      if (error){
        console.log(error);
      }else{
        console.log('sucess');
      }
    });
    res.redirect("/");
  }else
    res.render("list", {listTitle: "today", newListItems: foundItems});
});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
 const item= new Item({
   name:itemName,
 });
 if (listName=== 'today'){
item.save();
res.redirect('/');}
else{
  List.findOne({name: listName},function (err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect('/'+listName);

  });
}

});

app.post("/delete",(req,res)=>{
const checkedItemId= req.body.checkbox;
const listName= req.body.listName;

if(listName==='today'){
Item.findByIdAndRemove(checkedItemId ,(err)=>{
  if(err){
    console.log(err);

  }else{
  console.log('sucess');
  }
res.redirect('/');
});
}else
 List.findOneAndUpdate({name:listName},{$pull:{items:{id:checkedItemId}}},function(err,foundList){
  if(!err){
    res.redirect('/'+listName);
  }
});

});
app.get("/:customListName", function(req,res){



const customListName=_.capitalize(req.params.customListName);

 List.findOne({name:customListName},function(err,foundList){
   if (!err){
   if (!foundList){

      const list= new List({
        name: customListName,
        items:defaultItems
         });
         list.save();
res.redirect("/"+customListName);
   }else
  {console.log (foundList);
   res.render("list", {listTitle: foundList.name, newListItems: foundList.items});}
 }


});
});
app.get("/about", function(req, res){
  res.render("about");
});
let port=process.env.PORT;
if (port==null||port ==""){
  port= 3000;
}
app.listen(port , function() {
  console.log("Server started ");
});
