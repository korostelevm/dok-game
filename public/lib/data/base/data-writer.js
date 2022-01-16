class DataWriter {
	constructor(dataEndPoint) {
		this.dataEndPoint = dataEndPoint || "/data";
	}

	async write(data) {
		const response = await fetch("/data", {
		    method: 'POST',
		    cache: 'no-cache',
		    headers: {
		      'Content-Type': 'application/json',
		    },
		    body: JSON.stringify(data),
		});	
		return response.text();
	}
}