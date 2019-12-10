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

app.get("/admin-Remove", async function(req, res) {
   let rows = await removeClass(req.query);
   let subject = await getsubject(req.query);
   let message = "not deleted yet";
   console.log(rows);
   if (rows.affectedRows > 0) {
        message= "Class successfully deleted correctly!";
    }
  
   res.render("adminRemove", {"subject":subject, "message":message}); 
   
});

app.get("/classPage", async function(req, res) {
    let temp = [];
    //console.log(req);
    let id = parseInt(req.query.classId);
    //console.log("id: " + id);
    let comments = await getComments(id);
    let class_ = await getClassAtId(id);
    //console.log(class_);
    if(Object.entries(comments).length === 0 ) {
        comments = "None";
    }
    res.render("classPage", {"comments":comments, "classInfo":class_});

});

app.post("/newPost", async function(req, res) {
    // here is what will be triggered when add class button is clicked
    console.log(req.query.text);
    //let rows = await newPost()
    res.redirect("/classPage?classId="+req.query.classId);
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
    console.log(checkAdmin);

    if (isUser && passCorrect) {
       res.send({"loginSuccess":true, "isAdmin":checkAdmin});
       
       req.session.authenticated = true;
    } else {
       res.send(false);
    }

});

// app.post("/loginProcess", function(req, res) {
    
//     if ( req.body.username == "admin" && sha256(req.body.password) == "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b") {
//       req.session.authenticated = true;
//       res.send({"loginSuccess":true});
//     } else {
//       res.send(false);
//     }

    
// });

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

function newPost(text, username, classId, threadId, identifier) {
    let conn = dbConnection();
    

    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO project_comments
                        (text, username, classId, threadId, identifier)
                         VALUES (?,?,?,?,?)`;
        
           let params = [text, username, classId, threadId, identifier];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise   
}

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

function getComments(classId) {
    let conn = dbConnection();
    
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT text, userName, threadId, identifier
                      FROM project_comments
                      WHERE classId = ?`;
                      
          let params = [classId];
    
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function getClassAtId(classId) {
    let conn = dbConnection();
    
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT subject, classNumber, title, id
                      FROM project_classes
                      WHERE id = ?`;
                      
          let params = [classId];
    
        
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