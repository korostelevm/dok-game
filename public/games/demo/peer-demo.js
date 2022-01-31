class PeerDemo extends GameBase {
	constructor(engine) {
		super(engine);
		const peer = this.peer = new Peer(null, {
			host: 'peerjs-336100.uc.r.appspot.com',
			path: "/",
			secure:true,
		});

		this.peer.on('open', (id) => {
            console.log('ID: ' + peer.id);
            console.log("Awaiting connection...");
        });

		peer.on('connection', function (c) {
            // Allow only a single connection
            if (this.conn && this.conn.open) {
                c.on('open', function() {
                    c.send("Already connected to another client");
                    setTimeout(function() { c.close(); }, 500);
                });
                return;
            }

            this.conn = c;
            console.log("Connected to: " + conn.peer);
            this.ready();
        });
        peer.on('disconnected', function () {
            console.log('Connection lost. Please reconnect');
            peer.reconnect();
        });
        peer.on('close', function() {
            this.conn = null;
            console.log('Connection destroyed');
        });
        peer.on('error', function (err) {
            console.error(err);
        });        
	}

	async onExit(engine) {
        await super.onExit(engine);
		if (this.conn) {
			this.conn.close();
		}
		this.peer.destroy();
	}

	ready() {
        this.conn.on('data', function (data) {
            console.log("Data recieved", data);
        });
        this.conn.on('close', function () {
            console.log("Connection reset. Awaiting connection...");
            this.conn = null;
        });
    }

}