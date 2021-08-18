import express, { json } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(json());

const PORT = process.env.PORT || 5001;
//database 
const connection = mysql.createConnection({
    host : process.env.HOST,
    user : process.env.USERNAME,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
});

connection.connect((err) => {
    if(err) throw err;
    console.log("DB connected.");
    app.listen(PORT, () => console.log(`Server started in PORT ${PORT}`));
    
});

//api req

app.post('/register', (req, res) => {
    
    let password = req.body.password;
    let email = req.body.email;

    var sql = "INSERT INTO `tbl_login_master`(`email`, `username`, `password`) VALUES (?,?,?)";
    connection.query(sql,[email, email, password], (err, result) => {
        if(err) throw err;
        res.status(200).json({message : "success","rows" : result.affectedRows});
    })
});

app.post('/login', (req, res) => {
    let password = req.body.password;
    let email = req.body.email;

    var sql="select * from tbl_login_master where username=? and password=?";
    connection.query(sql,[email, password], (err, result) => {
        res.status(200).json(result);
    })
});
