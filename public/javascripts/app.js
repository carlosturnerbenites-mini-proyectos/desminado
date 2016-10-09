// Mostrar latlong in mousemove
// Cambiar Icono de personas por palma de cera
var form_bomb = document.querySelector("#bomb"),
	form_zone = document.querySelector("#zone"),
	map,
	creando_zona = false,
	positions_new_zone = [],
	zonas,
	minas,
	shape = {
		coords: [1, 1, 1, 20, 18, 20, 18, 1],
		type: 'poly'
	}

var markers = []
var polygons = []

function getData(){
	$.get( "/zonas", function( res_zonas ) {
		console.log(res_zonas)
		zonas = res_zonas
		$.get( "/minas", function( res_minas ) {
			console.log(res_minas)
			minas = res_minas
			initMap()
		});
	});
}


form_bomb.addEventListener("submit",function(event){
	event.preventDefault()
	console.log(this)
	ubicar_bomba({lat:parseFloat(form_bomb.lat.value),lng:parseFloat(form_bomb.lng.value)})
})

form_zone.addEventListener("submit",function(event){
	event.preventDefault()
	console.log(this)
	var f = this.positions.value.split("+")
	data = []
	f.forEach(function(sPositions,i,array){
		array[i] = array[i].trim().split(",")
		data.push({lat:parseFloat(array[i][0]),lng:parseFloat(array[i][1])})
	})
	console.log(data)
	cercar_zona(data)
})

/*var zonas = [
	{
		positions : [
			{lat: 4.80234483976469, lng: -75.3841495513916},
			{lat: 4.79126869593527, lng: -75.3870677947998},
			{lat: 4.781603651586164, lng: -75.38556575775146},
			{lat: 4.780705565314763, lng: -75.38058757781982},
			{lat: 4.7918246456599976, lng: -75.37990093231201},
			{lat: 4.80234483976469, lng: -75.3841495513916}
		]
	}
]

var minas = [
	{deactivate:true,position:{lat: 4.791610, lng: -75.383090}},
	{deactivate:false,position:{lat: 4.791610, lng: -75.384090}},
	{deactivate:true,position:{lat: 4.781610, lng: -75.384090}},
	{deactivate:false,position:{lat: 4.790979209027877, lng: -75.399169921875}},
]*/

function cercar_zona(positions){
	if(!confirm("Crear Zona?")) {
		positions_new_zone = []
		return
	}
	var polygon = new google.maps.Polygon({
		paths: positions,
		strokeColor: 'green',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: 'green',
		fillOpacity: 0.35
	})
	var con_minas = false

	minas.forEach(function (mina,index) {
		mina.position
		var p = new google.maps.LatLng(mina.position.lat,mina.position.lng)
		var bool = google.maps.geometry.poly.containsLocation(p, polygon)
		if(bool && mina.deactivate){
			con_minas = true
		}
	})

	if(con_minas) polygon.setOptions({fillColor: '#FF0000',strokeColor: '#FF0000'})

	polygon.setMap(map);
	polygons.push(polygon)

	var nueva_zona = {
		positions:positions,
		nombre: "Nombre Estatico"
	}

	$.ajax({
		url:"/zona",
		type:"POST",
		data:JSON.stringify(nueva_zona),
		contentType:"application/json; charset=utf-8",
		dataType:"json",
		success: function(response){
			console.log(response)
		}
	})

	positions_new_zone = []
}

function ubicar_bomba(position){
	if(!confirm("Crear Realmente?")) return
	var icon = {
		url: "images/bomb_deactivate.png",
		// This marker is 20 pixels wide by 32 pixels high.
		size: new google.maps.Size(20, 32),
		// The origin for this image is (0, 0).
		origin: new google.maps.Point(0, 0),
		// The anchor for this image is the base of the flagpole at (0, 32).
		anchor: new google.maps.Point(0, 32)
	};

	var marker = new google.maps.Marker({
		position: position,
		shape: shape,
		map: map,
		icon:icon,
		draggable: false,
		animation: google.maps.Animation.DROP,

		title: 'Nueva Mina '
	});
	marker.addListener('click', actionBomb.bind(marker));
	var nueva_mina = {deactivate:0,position:position}
	minas.push(nueva_mina)
	markers.push(marker)
	$.ajax({
		url:"/mina",
		type:"POST",
		data:JSON.stringify(nueva_mina),
		contentType:"application/json; charset=utf-8",
		dataType:"json",
		success: function(response){
			console.log(response)
		}
	})

}

function re_draw_zones(){
	console.log("re_draw_zones")
	polygons.forEach(function(e){
		e.setMap(null)
	})
	zonas.forEach(function(zona){
	var polygon = new google.maps.Polygon({
		paths: zona.positions,
		strokeColor: 'green',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: 'green',
		fillOpacity: 0.35
	});
	var con_minas = false

	minas.forEach(function (mina,index) {
		mina.position
		var p = new google.maps.LatLng(mina.position.lat,mina.position.lng)
		var bool = google.maps.geometry.poly.containsLocation(p, polygon)
		if(bool && mina.deactivate){
			con_minas = true
		}
	})

	if(con_minas) polygon.setOptions({fillColor: '#FF0000',strokeColor: '#FF0000'})

	polygon.setMap(map);
	polygons.push(polygon)
})
}

function initMap() {
	var myLatLng = {lat: 4.791610, lng: -75.383090}

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: myLatLng
		//disableDefaultUI: true
	})

	zonas.forEach(function(zona){
		var polygon = new google.maps.Polygon({
			paths: zona.positions,
			strokeColor: 'green',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: 'green',
			fillOpacity: 0.35
		});
		var con_minas = false

		minas.forEach(function (mina,index) {
			mina.position
			var p = new google.maps.LatLng(mina.position.lat,mina.position.lng)
			var bool = google.maps.geometry.poly.containsLocation(p, polygon)
			if(bool && mina.deactivate){
				con_minas = true
			}
		})

		if(con_minas) polygon.setOptions({fillColor: '#FF0000',strokeColor: '#FF0000'})

		polygon.setMap(map);
		polygons.push(polygon)
	})

	minas.forEach(function (mina,index) {
		var url = mina.deactivate ? "images/people.png" : "images/bomb_deactivate.png"

		var icon = {
			url: url,
			// This marker is 20 pixels wide by 32 pixels high.
			size: new google.maps.Size(20, 32),
			// The origin for this image is (0, 0).
			origin: new google.maps.Point(0, 0),
			// The anchor for this image is the base of the flagpole at (0, 32).
			anchor: new google.maps.Point(0, 32)
		};

		var marker = new google.maps.Marker({
			position: mina.position,
			shape: shape,
			map: map,
			icon:icon,
			draggable: false,
			animation: google.maps.Animation.DROP,

			title: 'Mina ' + index
		});
		marker.addListener('click', actionBomb.bind(marker));
		markers.push(marker)
	})

	google.maps.event.addListener(map, 'mousemove', function(event) {
		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		var position = {lat: lat, lng: lng}
		document.querySelector("#current_lat").innerHTML = position.lat
		document.querySelector("#current_lng").innerHTML = position.lng
	})

	google.maps.event.addListener(map, 'click', function(event) {

		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		var position = {lat: lat, lng: lng}

		if(!creando_zona){

			ubicar_bomba(position)
		}else{
			positions_new_zone.push(position)
		}

	});


	document.body.addEventListener("keydown",function(event){
		if(event.ctrlKey){creando_zona = true}
		console.log("creando_zona " + creando_zona)
	})
	document.body.addEventListener("keyup",function(event){
		if(!event.ctrlKey){creando_zona = false}
		console.log("creando_zona " + creando_zona)

		cercar_zona(positions_new_zone)
	})
}

function actionBomb(event) {
	console.log(event)
	/*if (this.getAnimation() !== null) {
		this.setAnimation(null);
	} else {
		this.setAnimation(google.maps.Animation.BOUNCE);
	}*/
	var mina = minas.filter(function(e){return (e.position.lat == event.latLng.lat()  && e.position.lng == event.latLng.lng())})
	mina = mina[0]
	console.log(mina)
	if(!mina.deactivate){
		if(confirm('Desactivar?')){
			mina.deactivate = 1
			var maker_mina = markers.filter(function(e){return (e.position.lat() == event.latLng.lat()  && e.position.lng() == event.latLng.lng())})


			maker_mina = maker_mina[0]
			maker_mina.icon.url = "images/people.png"
			maker_mina.changed()
			//map.changed()
			map.setCenter(maker_mina.getPosition())

		}
	}
	$.ajax({
		url:"/mina",
		type:"PUT",
		data:JSON.stringify({mina_id:mina.mina_id}),
		contentType:"application/json; charset=utf-8",
		dataType:"json",
		success: function(response){
			console.log(response)
		}
	})
	console.log(mina)
}
