var Cookie = {
  get: function(name) {
    var matches = window.parent.document.cookie.match(new RegExp(
      '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
    ));

    return matches ? decodeURIComponent(matches[1]) : undefined;
  },

  set: function(name, value, options) {
    options = options || {};
    var expires = options.expires,
      updatedCookie, propName,
      d = new Date();

    if (typeof expires === 'number' && expires) {
      d.setTime(d.getTime() + expires * 1000);
      expires = options.expires = d;
    } else {
      expires = new Date(d.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    if (expires && expires.toUTCString) {
      options.expires = expires.toUTCString();
    }
    value = encodeURIComponent(value);
    updatedCookie = name + '=' + value;
    for (propName in options) {
      if (!options.hasOwnProperty(propName)) {
        continue;
      }
      updatedCookie += '; ' + propName;
      var propValue = options[propName];

      if (propValue !== true) {
        updatedCookie += '=' + propValue;
      }
    }
    window.parent.document.cookie = updatedCookie;
  },

  delete: function(name) {
    this.set(name, '', { expires: -1 });
  }
};

export { Cookie };
