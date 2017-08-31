var isMobile = (function() {
  if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) ||
  navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) ||
  navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) ||
  navigator.userAgent.match(/Windows Phone/i)) {
    return true;
  }

  return false;
})();

var locationUrl = document.location.href,
  appOptions;

// if (locationUrl.indexOf('school.mosreg') > -1) {
//   appOptions = {
//     authUrl: 'https://login.school.mosreg.ru/oauth2',
//     grantUrl: 'https://api.school.mosreg.ru/v1/authorizations',
//     scope: '',
//     clientId: '',
//     redirectUrl: window.location.href + '/?auth=true',
//     provider: 'mosreg-1af',
//     api: 'https://api.school.mosreg.ru/v1/',
//     isMobile: isMobile,
//     userLink: 'https://school.mosreg.ru/user/user.aspx?user=',
//     cdnPath: 'https://ad.csdnevnik.ru/special/staging/1af/img/lessons/'
//   };
// } else {
appOptions = {
  authUrl: 'https://login.dnevnik.ru/oauth2',
  grantUrl: 'https://api.dnevnik.ru/v1/authorizations',
  scope: 'CommonInfo,ContactInfo,EducationalInfo,FriendsAndRelatives',
  clientId: '4d34a49fc2824bfcabdadda2a6381f58',
  redirectUrl: window.location.href + '?auth=true',
  provider: '1af',
  api: 'https://api.dnevnik.ru/v1/',
  isMobile: isMobile,
  userLink: 'https://dnevnik.ru/user/user.aspx?user='
  //     cdnPath: './dist/img/lesson0',
  //     cdnPathMain: './dist/img/'
  // cdnPath: 'https://ad.csdnevnik.ru/special/staging/1af/img/lesson1/',
  // cdnPathMain: 'https://ad.csdnevnik.ru/special/staging/1af/img/'
};
// 

export { appOptions };
