import express, { json } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

app.post('/register', async (req, res) => {
    
    let password = req.body.password;
    let email = req.body.email;
    let name = req.body.name;
    let hashPassword = await bcrypt.hash(password, 10); //10 - salt value
    var sql = "INSERT INTO `tbl_login_master`(`name`,`email`, `username`, `hashed_password`) VALUES (?,?,?,?)";
    connection.query(sql,[name, email, email, hashPassword], (err, result) => {
        if(err) throw err;
        if(result.affectedRows>0)
            res.status(200).json({message : "User registered.","rows" : result.affectedRows});
        else
            res.status(304).json();
    })
});

app.post('/login', (req, res) => {
    let password = req.body.password;
    let email = req.body.email;


    var sql="select * from tbl_login_master where username=?";
    connection.query(sql,[email], async (err, result) => {
        if(err) throw err;

        if(result.length > 0)
        {
            //jwt token
           
            // reusult.accessToken = accessToken;
            try {
                // res.status(200).json({message: 'Success',data:result});
                const accessToken = generateAuthToken(email);
                result[0].accessToken = accessToken;
                if( await bcrypt.compare(password,result[0].hashed_password) )
                    res.status(200).json({message: 'Success',data:result});
                else
                    res.status(401).json({message: 'Wrong Password'});
            } catch (error) {
                console.log(error);
            }
            
        }
        else
        {
            res.status(401).json({message: 'Failed'});
        }    
            

    })
});

const generateAuthToken = (user) =>
{
    return jwt.sign({"user":user}, process.env.ACCESS_TOKEN,{ expiresIn:10 });
}