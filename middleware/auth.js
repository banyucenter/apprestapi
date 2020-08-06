var connection = require('../koneksi');
var mysql = require('mysql');
var md5 = require('md5');
var response = require('../res');
var jwt = require('jsonwebtoken');
var config = require('../config/secret');
var ip = require('ip');
var nodemailer = require('nodemailer')

let smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "reactjstutorialindonesia@gmail.com",
        pass: "Reactjs2020"
    }
})


var rand, mailOptions, host, link

exports.verifikasi = function(req,res){
    console.log(req.protocol)
    if((req.protocol + "://" + req.get('host')) == ("http://" + host)){
        if(req.query.id == rand) {
            connection.query('UPDATE user SET isVerified=? WHERE email=?', [1, mailOptions.to],
                function(error, rows, fields){
                    if(error){
                        console.log(error)
                    }else {
                        response.ok("Berhasil merubah data verifikasi", res)
                    }
                }
            )

            res.end("<h1>Email anda " + mailOptions.to + "telah terverifikasi")
        }
        else {
            res.end("<h1>Email anda " + mailOptions.to + "tidak terverifikasi")
        }
    }
}

//controller untuk registrasi user
exports.registrasi = function (req, res) {
    var post = {
        username: req.body.username,
        email: req.body.email,
        password: md5(req.body.password),
        role: req.body.role,
        tanggal_daftar: new Date(),
        isVerified: 0
    }

    var query = "SELECT email FROM ?? WHERE ??=?";
    var table = ["user", "email", post.email];

    query = mysql.format(query, table);

    connection.query(query, function (error, rows) {
        if (error) {
            console.log(error);
        } else {
            if (rows.length == 0) {
                var query = "INSERT INTO ?? SET ?";
                var table = ["user"];
                query = mysql.format(query, table);
                connection.query(query, post, function (error, rows) {
                    if (error) {
                        console.log(error);
                    } else {
                        rand = Math.floor((Math.random() * 100) + 54)
                        host = "localhost:3001"
                        link = "http://" + host + "/auth/verify?id=" + rand;
                        mailOptions = {
                            to: post.email,
                            subject: "Please confirm your Email account",
                            html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
                        }
                        console.log(mailOptions);

                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                res.end("error");
                            } else {
                                console.log("Message sent: " + response.message);
                                response.ok("Berhasil menambahkan data user baru", res);
                                res.end("sent");
                            }
                        });
                    }
                });
            } else {
                response.ok("Email sudah terdaftar!", res);
            }
        }
    })
}

// controller untuk login
exports.login = function (req, res) {
    var post = {
        password: req.body.password,
        email: req.body.email
    }

    var query = "SELECT * FROM ?? WHERE ??=? AND ??=?";
    var table = ["user", "password", md5(post.password), "email", post.email];

    query = mysql.format(query, table);

    connection.query(query, function (error, rows) {
        if (error) {
            console.log(error);
        } else {
            if (rows.length == 1) {
                var token = jwt.sign({ rows }, config.secret, {
                    //ubah expires dalam ms
                    expiresIn: '10000'
                });

                id_user = rows[0].id;
                //1 tambahan row username
                username = rows[0].username;
                //2 tambahan row role
                role = rows[0].role;

                //3 variable expires
                // var expired = 30000
                var expired = 10000

                var isVerified = rows[0].isVerified

                var data = {
                    id_user: id_user,
                    access_token: token,
                    ip_address: ip.address()
                }

                var query = "INSERT INTO ?? SET ?";
                var table = ["akses_token"];

                query = mysql.format(query, table);
                connection.query(query, data, function (error, rows) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.json({
                            success: true,
                            message: 'Token JWT tergenerate!',
                            token: token,
                            //4 tambahkan expired time
                            expires: expired,
                            currUser: data.id_user,
                            user: username,
                            //3 tambahkan role
                            role: role,
                            isVerified: isVerified
                        });
                    }
                });
            }
            else {
                res.json({ "Error": true, "Message": "Email atau password salah!" });
            }
        }
    });
}

exports.halamanrahasia = function (req, res) {
    response.ok("Halaman ini hanya untuk user dengan role = 2!", res);
}


//menampilkan semua data mahasiswa
exports.adminmahasiswa = function (req, res) {
    connection.query('SELECT * FROM mahasiswa', function (error, rows, fileds) {
        if (error) {
            console.log(error);
        } else {
            response.ok(rows, res)
        }
    });
};