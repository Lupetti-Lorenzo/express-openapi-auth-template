// Login user
document.addEventListener(
	'click',
	(event) => {
		event.preventDefault();
		if (event.target.matches('#login-btn')) {
			var emailInput = document.getElementById('email-input');
			var pwdInput = document.getElementById('pwd-input');
			var data = {
				email: emailInput.value,
				password: pwdInput.value,
			};
			Http.post('/api/auth/login', data).then(async (res) => {
				const data = await res.json();
				const accessToken = data.accessToken;
				console.log(accessToken);
				// set access token to local storage
				localStorage.setItem('token', accessToken);
				// redirect the user to the users page
				window.location.href = '/users';
			});
		}
	},
	false
);
