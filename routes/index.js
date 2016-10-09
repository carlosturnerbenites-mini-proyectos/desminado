var express = require('express');
var Q = require('q');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/minas', function(req, res, next) {

	db.serialize(function() {
		db.all("SELECT * FROM minas", function(err, rows) {
			var promises = []

			rows.forEach(function(mina){
				mina.position = {
					lat:mina.lat,
					lng:mina.lng,
				}
				promises.push(
					new Promise(function(resolve,reject){
						db.get("SELECT * FROM zonas WHERE zona_id = " + mina.zona_id, function(err, zona) {
							mina.zona = zona
							resolve()
						})
					})
				)
			});
			Q.all(promises).then(function(){
				res.json(rows)
			});
		});
	});
});

router.get('/zonas', function(req, res, next) {
	db.serialize(function() {
		db.all("SELECT * FROM zonas", function(err, rows) {
			var promises = []

			rows.forEach(function(zona){
				promises.push(
					new Promise(function(resolve,reject){
						db.all("SELECT * FROM cordenadas_zonas WHERE zona_id = " + zona.zona_id, function(err, cordenadas) {
							zona.positions = cordenadas
							resolve()
						})
					})
				)
			});
			Q.all(promises).then(function(){
				res.json(rows)
			});
		});
	});
});

router.post('/mina', function(req, res, next) {
	var data = req.body
	console.log(data)
	console.log(typeof data)
	db.serialize(function() {
		var sql_minas = db.prepare("INSERT INTO minas (deactivate,lat,lng) VALUES (?,?,?)");
		sql_minas.run(data.deactivate,data.position.lat,data.position.lng,function(err){
			res.json({message:"Mina Creada"})
		})

	})
})

router.post('/zona', function(req, res, next) {
	var data = req.body
	console.log(data)
	console.log(typeof data)
	if(!data.positions.length) return res.json({message:"Error al crear la zona, no se enviaron coordenadas"})

	db.serialize(function() {

	var sql_zonas = "INSERT INTO zonas (nombre) VALUES (?)"
	var params_sql_zonas = [data.nombre]
	db.run(sql_zonas,params_sql_zonas,function(){
		console.log(".-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-")
		console.log(this.lastID)
		var zona_id = this.lastID
		console.log(".-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-")
		var sql_cordenadas_zonas = db.prepare("INSERT INTO cordenadas_zonas (zona_id,lat,lng) VALUES (?,?,?)");
		data.positions.forEach(function(position){
			sql_cordenadas_zonas.run(zona_id,position.lat,position.lng)
		})
		sql_cordenadas_zonas.finalize();
		return res.json({message:"Zona Creada"})
	})

	})
})


module.exports = router;
