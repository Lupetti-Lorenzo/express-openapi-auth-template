var Http = (() => {
	// Set Http methods
	return {
		get: (path) => apiCall(path, getOptions('GET')),
		post: (path, data) => apiCall(path, getOptions('POST', data)),
		put: (path, data) => apiCall(path, getOptions('PUT', data)),
		delete: (path) => apiCall(path, getOptions('DELETE')),
	};
})();

// automatically try to refresh the token if get a bad request
const apiCall = async (path, options) => {
	const res = await fetch(path, options);
	console.log(res.status);
	if (res.status == 400) {
		console.log('Bad request');
		// try to refresh the token
		const resToken = await fetch('/api/auth/token');
		if (resToken.status == 400) {
			console.log('Not refreshed');
			return;
		}
		const accessTokenData = await resToken.json();
		const accessToken = accessTokenData.accessToken;
		// set access token to local storage
		localStorage.setItem('token', accessToken);
		// try to call the api again
		return fetch(path, getOptions(options.method, options.body));
	}
	// if all good return the response
	return fetch(path, options);
};

// Setup request for json
var getOptions = (verb, data) => {
	var options = {
		dataType: 'json',
		method: verb,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	};
	// if token exists, add it to the header
	if (localStorage.getItem('token')) {
		options.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
	}

	if (data) {
		options.body = JSON.stringify(data);
	}
	return options;
};
