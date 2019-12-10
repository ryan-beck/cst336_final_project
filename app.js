const express = require("express");
const mysql   = require("mysql");
const app = express();
const sha256  = require("sha256");
const session = require('express-session');
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded());
app.use(session({ secret: 'any word', cookie: { maxAge: 60000 }}));

//routes
app.get("/", function(req, res){
    // res.send("it works!");
    res.render("login");
});

app.get("/search", function(req, res){
    res.render("search");
});

app.post("/search", async function(req, res){
    // search database for requested fields
    
    let rows = await searchClasses(req.body);
    if(Object.entries(rows).length === 0 ) {
        rows = "None";
    }
    res.render("search", {"classes": rows});
});


//testing login for regular users
app.get("/regular", function(req, res){
    res.render("regular");
});


app.get("/admin", async function(req, res) {
    if (req.session.authenticated) {
        let classList =  await getClassList();
        res.render("admin", {"classList":classList}); 
    } else {
        res.render("login");
    }
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

app.get("/admin-Remove", async function(req, res) {
   let rows = await removeClass(req.query);
   let subject = await getsubject(req.query);
   let message = "Not deleted yet";
   console.log(rows);
   if (rows.affectedRows > 0) {
        message= "Class successfully deleted correctly!";
    }
  
   res.render("adminRemove", {"subject":subject, "message":message}); 
   
});

<<<<<<< HEAD
app.get("/admin-update", async function(req, res){
    if (req.session.authenticated) { 
 
        let classInfo = await getClassInfo(req.query.id);    
        //console.log(authorInfo);
        res.render("adminUpdate", {"classInfo":classInfo}); 
       
   }  else { 
    
       res.render("login"); 
   
   }
    
});

app.post("/admin-update", async function(req, res) {
    if (req.session.authenticated) { 
        let rows = await updateClass(req.body);
        
        let classInfo = req.body;
        console.log(rows);
        //res.send("First name: " + req.body.firstName); //When using the POST method, the form info is stored in req.body
        let message = "Class was not updated!";
        if (rows.affectedRows > 0) {
          message= "Class successfully updated!";
        }
      res.render("adminUpdate", {"message":message, "classInfo":classInfo});
    } else { 
    
       res.render("login"); 
   
   } 
});

=======
>>>>>>> efe7a4abbf89f372e5bf5250b82e020b0b79959a
app.get("/classPage", function(req, res) {
    //console.log(req);
    let id = req.query.classId;
    console.log("id: " + id);
    res.render("classPage", {"classId":id});

});

app.post("/loginProcess", async function(req, res) {
    
    let users = await getUsers();
    var isUser = false;
    var passCorrect = false;
    var checkAdmin = false;


    for (var i = 0; i < users.length; i++){

        if (req.body.username == users[i].username){
            isUser = true;
        }
        if (isUser){
            if (req.body.password == users[i].pass){
                passCorrect = true;
                if (users[i].isAdmin == 1){
                    checkAdmin = true;
                }
                break;
                
            }
        }
    }
    // console.log(checkAdmin);

    if (isUser && passCorrect) {
        req.session.authenticated = true;
        res.send({"loginSuccess":true, "isAdmin":checkAdmin});
       
       
    } else {
       res.send(false);
    }

});



app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

function getUsers(){
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM project_users
                      `;
            // console.log(sql);        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
            //   res.send(rows);
              conn.end();
            //   console.log(rows);
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}

function insertClass(body) {
    let conn = dbConnection();
    
    //console.log(body.subject);
    console.log(body.classNumber);
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO project_classes
                        (subject, classNumber, title)
                         VALUES (?,?,?)`;
        
           let params = [body.subject, body.classNumber, body.title];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}
function removeClass(body) {
    let conn = dbConnection();
    
    //console.log(body.subject);
    console.log(body.classNumber);
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM project_classes
                      WHERE subject = ? AND classNumber = ?`;
                      
        
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

function updateClass(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `UPDATE project_classes
                      SET subject = ?, 
                          classNumber  = ?, 
                                title = ?
                     WHERE id = ?`;
        
           let params = [body.subject, body.classNumber, body.title, body.id];
        
           console.log(sql);
           
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}


function getsubject(){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT subject, classNumber
                      FROM project_classes
                      ORDER BY subject`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}//getCategories

function searchClasses(body) {
    let conn = dbConnection();
    
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT id, subject, classNumber
                      FROM project_classes
                      WHERE subject = ?`;
                      
          let params = [body.subject];
          
          if(body.classNumber) {
              sql += `AND classNumber = ?`;
              params.push(body.classNumber);
          }
    
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

<<<<<<< HEAD
function getClassList(){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                        FROM project_classes
                        ORDER BY subject, classNumber`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function getClassInfo(id){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                      FROM project_classes
                      WHERE id = ?`;
        
           conn.query(sql, [id], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows[0]); //Query returns only ONE record
           });
        
        });//connect
    });//promise 
}

=======
>>>>>>> efe7a4abbf89f372e5bf5250b82e020b0b79959a
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