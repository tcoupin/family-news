module.exports = function(req, res, next) {
	if (req.user === undefined && conf.admin_token !== undefined) {
		if (req.headers['x-admin-token'] !== undefined && req.headers['x-admin-token'] == conf.admin_token)
		req.user = {
			"id": "local",
			"displayName": "Administrateur",
			"name": {
				"familyName": "",
				"givenName": "Administrateur"
			},
			"photos": [{
				"value": "https://lh4.googleusercontent.com/-OXGmm-8CycU/AAAAAAAAAAI/AAAAAAAANTY/AM1ZKhFnSHE/photo.jpg?sz=50"
			}],
			"provider": "local",
			"role": ["view", "admin"],
			"token": "12345678901234567901234567890"
		}
	}
	next();
}