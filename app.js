const express  = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();


app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static('public'));


mongoose.connect("mongodb+srv://admin-shagun:Test123@cluster0.mqqidyr.mongodb.net/todolistDB",
  {
    useNewUrlParser: true
  }
);

const itemSchema = new mongoose.Schema({
  name: String 
});

const listSchema = new mongoose.Schema({
name : String,
items : [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
 name : "Welcome to your to-do-list!"
});

const item2 = new Item({
  name : "Hit the + button to add a new item."
 });

 const item3 = new Item({
  name : "<== Hit this to delete an item."
 });

 const defaultitem = [item1,item2,item3] ;



app.get('/',function(req,res){

  Item.find({},function(err,docs){

   if(docs.length === 0){

  Item.insertMany(defaultitem ,function(err){
  if(err){
    console.log("ERROR");
  }
  else{
    console.log("Successfully added dafault item to DB");
  }
 });
     res.redirect('/');
}

     else {
      res.render('list', {listTitle: "Today" , newitems: docs });
     }


    });
  });

     
 


    app.post("/delete", function(req, res){
      const checkedItemId = req.body.checkbox;
      const listName = req.body.listName;
    
      if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err){
          if (!err) {
            console.log("Successfully deleted checked item.");
            res.redirect("/");
          }
        });
      } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
          if (!err){
            res.redirect("/" + listName);
          }
        });
      }
    
    
    });

    app.get("/:listname",function(req,res){
      const listname =  _.capitalize(req.params.listname);

      List.findOne({name : listname },function(err,foundlist){
        if(!err){
          if(!foundlist){
            const list = new List({
              name :  listname,
              items : defaultitem
            });
            list.save();
            res.redirect('/'+ listname);
          }
          else{
            res.render('list', {listTitle: foundlist.name , newitems: foundlist.items });
          }
        }
      })
  
    });




app.post('/',function(req,res){

  const newitem = req.body.w1;
  const newlist = req.body.list ;

  const item = new Item({
    name : newitem
  });

  if(newlist === "Today"){
    item.save();
    res.redirect('/');
  }

  else{
    List.findOne({name: newlist},function(err,foundlist){
      if(!err){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+newlist)

      }
    });
  }

});




app.listen(3000,function(){
    console.log("server running on port 3000");
});


