app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.service('Authentication', function($rootScope, AUTH_EVENTS, ApiRequest) {

	return {
		getToken: function(pin, keypadId, next) {
			var params = {
				pin: pin,
				keypadId: keypadId
			};

			var cb = function(data) {
				if (data.success === true) {
					if (next) next(data);
				} else {
					$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
				}
			};
			ApiRequest.getStaffToken(params, cb);
		}
	};
});
