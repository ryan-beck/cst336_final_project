const express = require("express");
const mysql   = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded());

//routes
app.get("/", function(req, res){
    // res.send("it works!");
    res.render("login");
});

app.get("/search", function(req, res){
    // res.send("it works!");
    //res.render("search");
});

app.post("/search", function(req, res){
    // search data base for requested fields
    // rows = search(req.body);
});

app.get("/admin", function(req, res) {
   res.render("admin"); 
});


app.get("/admin-add", function(req, res) {
   res.render("adminAdd"); 
});

app.post("/admin-add", async function(req, res) {
    let rows = await insertClass(req.body);
    
    let message = "Class WAS NOT added to the database!";
    if (rows.affectedRows > 0) {
        message= "Class successfully added!";
    }
    res.render("adminAdd", {"message":message});
});

app.get("/admin-Remove", function(req, res) {
   res.render("adminRemove"); 
});

app.post("/loginProcess", function(req, res) {
    
    if (req.body.password == "secret") {
       res.send({"loginSuccess":true});
    } else {
       res.send(false);
    }

    
});

function insertClass(body) {
    let conn = dbConnection();
    
    //console.log(body.subject);
    console.log(body.classNumber);
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO project_classes
                        (subject, classNumber)
                         VALUES (?,?)`;
        
           let params = [body.subject, body.classNumber];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function dbConnection(){

   let conn = mysql.createConnection({
                 host: "cst336db.space",
                 user: "cst336_dbUser3",
             password: "shl2ed",
             database: "cst336_db3"
       }); //createConnection

return conn;

}

//starting server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Express server is running...");
});