import { Cookie } from './cookie.js';
import { appOptions } from './settings.js';

var Auth = {
  token: undefined,
  auth: function(callback) {
    var token = Cookie.get(appOptions.provider + '_token') || getToken();

    if (void 0 !== token) {
      Cookie.delete(appOptions.provider + '_token');
      Cookie.set(appOptions.provider + '_token', token);
      this.token = token;
      if (typeof callback === 'function') {
        callback();
      }
    } else {
      var error = (/error=([-0-9a-zA-Z_]+)/).exec(window.location.hash) || [];

      if (void 0 !== error[1]) {
        Cookie.delete(appOptions.provider + '_token');
        this.token = undefined;
      } else {
        var url;

        if (appOptions.isMobile) {
          url = appOptions.authUrl + '?response_type=token&client_id=' + appOptions.clientId;
          url += '&scope=' + appOptions.scope + '&redirect_uri=' + appOptions.redirectUrl;
          window.location.href = url;
        } else {
          url = appOptions.authUrl + '?response_type=token&client_id=' + appOptions.clientId + '&scope=';
          url += appOptions.scope + '&redirect_uri=' + appOptions.redirectUrl;
          //var item = window.open(url, 'Авторизация', 'width=600,height=500,location=no');
          window.location.href = url;
          //window.close(item);
        }

      }
    }

    function getToken() {
      var token = (/access_token=([-0-9a-zA-Z_]+)/).exec(window.location.hash) || [];
      return token[1];
    }
  }
};

export { Auth };
