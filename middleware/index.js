var express = require('express');
var auth = require('./auth');
var router = express.Router();
var verifikasi = require('./verifikasi');

//daftarkan menu registrasi
router.post('/api/v1/register', auth.registrasi);
router.post('/api/v1/login', auth.login);

//alamat yang perlu otorisasi
router.get('/api/v1/rahasia', verifikasi(), auth.halamanrahasia);


module.exports = router;