var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');

db.serialize(function() {
	db.run("CREATE TABLE minas (deactivate BOOLEAN, lat REAL, lng REAL)");
	db.run("CREATE TABLE zonas (zona_id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT)");
	db.run("CREATE TABLE cordenadas_zonas (zona_id INTEGER, lat REAL, lng REAL,FOREIGN KEY(zona_id) REFERENCES zonas(zona_id)) ");

	var sql_minas = db.prepare("INSERT INTO minas (deactivate,lat,lng) VALUES (?,?,?)");
	sql_minas.run(true,4.791610,-75.383090)
	sql_minas.run(false,4.791610,-75.384090)
	sql_minas.run(true,4.781610,-75.384090)
	sql_minas.run(false,4.790979209027877,-75.399169921875)
	sql_minas.finalize();

	var zona_id = 1;

	/*var sql_zonas = db.prepare("INSERT INTO zonas (zona_id,nombre) VALUES (?,?)");
	sql_zonas.run(zona_id,"Zona 1")
	sql_zonas.finalize();*/
	var sql_zonas = "INSERT INTO zonas (nombre) VALUES (?)"
	var params_sql_zonas = ["Zona 1"]
	db.run(sql_zonas,params_sql_zonas,function(){
		console.log(".-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-")
		console.log(this.lastID)
		console.log(".-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-")
	})
	//sql_zonas.finalize();

	var sql_cordenadas_zonas = db.prepare("INSERT INTO cordenadas_zonas (zona_id,lat,lng) VALUES (?,?,?)");
	sql_cordenadas_zonas.run(zona_id,4.80234483976469,-75.3841495513916)
	sql_cordenadas_zonas.run(zona_id,4.79126869593527,-75.3870677947998)
	sql_cordenadas_zonas.run(zona_id,4.781603651586164,-75.38556575775146)
	sql_cordenadas_zonas.run(zona_id,4.780705565314763,-75.38058757781982)
	sql_cordenadas_zonas.run(zona_id,4.7918246456599976,-75.37990093231201)
	sql_cordenadas_zonas.run(zona_id,4.80234483976469,-75.384149551391)
	sql_cordenadas_zonas.finalize();

	db.each("SELECT * FROM cordenadas_zonas", function(err, row) {
		console.log(row);
	});
});

db.close();
