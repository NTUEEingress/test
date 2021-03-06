var connection ;
connection = new WebSocket("ws://"+window.location.hostname+":8081") ;
connection.onopen = function () {
	console.log("Connection opened") ;
	window.addEventListener( 'mouseclick' , function ( event ) {
		var msg = ( event.detail ).toString() ;
		console.log( msg ) ;
		connection.send( msg ) ;
	});
	window.addEventListener( 'BEGIN' , function ( event ) {
		var msg = ( event.detail ).toString() ;
		console.log( msg ) ;
		connection.send( msg ) ;
	});
	connection.onclose = function () {
		console.log("Connection closed");
	}
	connection.onerror = function () {
		console.error("Connection error");
	}
	connection.onmessage = function (event) {
		var tmp = parseInt( event.data ) ;
		console.log( tmp ) ;
		if ( tmp != -1 ) {
			receiveMouseEvent( Math.floor( ( tmp % 100 ) / 10 ) , tmp % 10 , Math.floor( tmp / 100 ) ) ;
		} else {
			reinit();
			console.log("SYNCRONOUS");
		}
	}
}

