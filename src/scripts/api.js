import { Cookie } from './cookie.js';
import { Auth } from './auth.js';
import { appOptions } from './settings.js';

var API = {
  init: function(token) {
    this.token = token || Cookie.get(appOptions.provider + '_token');
    this.model = {};
  },

  getData: function() {
    return this.model;
  },

  getUserInfoold: function(callback) {
    var that = this;

    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify({}),
      dataType: 'json',
      success: function(data) {
        // console.log(data);
        if (void 0 !== data) {

          // data.personId_str = '1000001906334';

          that.model.user = data;
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      },
      error: function() {
        Cookie.delete('token');
        Auth.auth();
      },
      processData: false,
      type: 'GET',
      url: appOptions.api + 'users/me/?access_token=' + this.token
    });
  },
  getUserInfo: function () {
      var url = appOptions.api + 'users/me/?access_token=' + this.token;
      var that = this;
      //?access_token=' + this.token
      return new Promise(function(resolve, reject) { // return new Promise
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.setRequestHeader('Accept', 'application/json');
        //req.setRequestHeader('Access-Token', key);
        req.onload = function() {
          if (req.status == 200) {
            that.model.user = JSON.parse(req.response);
            resolve(JSON.parse(req.response))
          } else {
            Cookie.delete('token');
            Auth.auth();
            reject(Error(req.statusText));
          }
        };
        req.onerror = function() { // network errors
          reject(Error('Network Error'));
        };
        req.send(); // Make the request
      });
    },
    getPersonInfo: function(id) {
      var url = `${appOptions.api}persons/${id}?access_token=${this.token}`;
      var that = this;
      //?access_token=' + this.token
      return new Promise(function(resolve, reject) { // return new Promise
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.setRequestHeader('Accept', 'application/json');
        //req.setRequestHeader('Access-Token', key);
        req.onload = function() {
          if (req.status == 200) {
            resolve(JSON.parse(req.response))
          } else {
            reject(Error(req.statusText));
          }
        };
        req.onerror = function() { // network errors
          reject(Error('Network Error'));
        };
        req.send(); // Make the request
      });
    },  
  getChildren: function(callback) {
    var that = this;
    //var url = appOptions.api + 'users/me/children/?access_token=' + this.token;
    var url = `${appOptions.api}user/${this.model.user.id}/children?access_token=${this.token}`;
    
    return new Promise(function(resolve, reject) { // return new Promise
      var req = new XMLHttpRequest();
      req.open('GET', url);
      //req.setRequestHeader('Access-Token', key);
      req.setRequestHeader('Accept', 'application/json');
      req.onload = function() {
        if (req.status == 200) {
          that.model.childrenId = JSON.parse(req.response);
          resolve(JSON.parse(req.response));
        } else {
          reject(Error(req.statusText));
        }
      };
      req.onerror = function() { // network errors
        reject(Error('Network Error'));
      };
      req.send(); // Make the request
    });
  },

  getEduGroup: function(userId, callback) {
    var that = this;
    var url = appOptions.api + 'persons/' + userId + '/edu-groups?access_token=' + this.token;
    
    return new Promise(function(resolve, reject) { // return new Promise
      var req = new XMLHttpRequest();
      req.open('GET', url);
      //req.setRequestHeader('Access-Token', key);
      req.setRequestHeader('Accept', 'application/json');
      req.onload = function() {
        if (req.status == 200) {
          that.model.childrenId = JSON.parse(req.response);
          resolve(JSON.parse(req.response));
        } else {
          reject(Error(req.statusText));
        }
      };
      req.onerror = function() { // network errors
        reject(Error('Network Error'));
      };
      req.send(); // Make the request
    });
  },

  getMarksFromPeriod: function(subjects, start, end, userId, callback) {
    var ans = [],
        that = this,
        iter = 0;
    console.log(subjects.length);  
    // if (subjects.length === 0) {
    //   $('#modal-parent').modal({
    //     fadeDuration: 250,
    //     fadeDelay: 1.5
    //   });
    //   $('.parent__title').html('Не найдено предметов !');
    //   //throw new Error('На найдено предметов !');
    // }
    const promises = [];

    for (var i = 0; i < subjects.length; i++) {
      
        let promise = new Promise(function(resolve, reject) { // return new Promise
          let url = appOptions.api + 'persons/' + userId +
          '/subjects/' + subjects[i].id + '/marks/' + start + '/' + end + '?access_token=' + that.token;
          
          var req = new XMLHttpRequest();
          req.open('GET', url);
          //req.setRequestHeader('Access-Token', key);
          req.setRequestHeader('Accept', 'application/json');
          req.onload = function() {
            if (req.status == 200) {
              ans.push({ subject: subjects[iter], data: JSON.parse(req.response) });
              //window.setTimeout(() => {
                resolve(JSON.parse(req.response));
              //}, 500);
              
            } else {
              reject(Error(req.statusText));
            }
          };
          req.onerror = function() { // network errors
            reject(Error('Network Error'));
          };
          req.send(); // Make the request
        });
        promises.push(promise);
    }
    var result = Promise.all(promises).then(() => {
      return ans;
    });

    return result;

  },




  // ---------------------------------------------------------------------------//
  getLonLat: function(callback) {
    $.ajax({
      url: '//freegeoip.net/json',
      method: 'POST',
      dataType: 'jsonp',
      success: function(response) {
        if (typeof callback === 'function') {
          callback(response);
        }
      }
    });
  },

  clearStorage: function() {
    var that = this;

    function deleteKeys(data) {
      for (var i = 0; i < data.Keys.length; i++) {
        that.deleteKeyFromDB(data.Keys[i].Key);
      }
    }
    that.getKeysFromDB({ label: appOptions.provider + '-activity', pageSize: 100, pageNumber: 1 }, function(data) {
      if (data.Paging.next) {
        that.getRecursivePage(data.Paging.next, function(data) {
          deleteKeys(data);
        });
      } else {
        deleteKeys(data);
      }
    });
  },

  getMainGroup: function(callback, id) {
    var that = this;

    id = id || this.model.user.personId_str;
    that.getEduGroup(id, function() {
      if (that.model.eduGroups.length === 0) {
        if (typeof callback === 'function') {
          callback(null);

          return;
        }
      }
      for (var i = 0; i < that.model.eduGroups.length; i++) {
        if (that.model.eduGroups[i].type === 'Group') {
          callback(that.model.eduGroups[i]);

          return;
        }
      }
      callback(null);
    });
  },

  getMarks: function(callback) {
    var that = this,
      ans = {};

    that.getMainGroup(function(group) {
      ans.group = group;
      that.getPeriods(group.id_str, function(data) {
        $.extend(ans, data);
        that.getFinalMarks(group.id_str, function(data) {
          ans.marks = data;
          callback(ans);
        });
      });
    });
  },

  getGroupFullInfo: function(group, callback) {
    var that = this,
      ans = {};

    that.getGroupProfile(group, function(data) {
      ans.group = data;
      if (!data) {
        ans.group = {};
        ans.group.id_str = group;
      }
      that.getSchool(function(data) {
        if (data) {
          if (data.length > 0) {
            that.getSchoolProfile(data[0].id_str, function(data) {
              ans.school = data;
              callback(ans);
            });
          } else {
            callback(null);
          }
        }

      });
    });
  },

  getGroupProfile: function(group, callback) {
    $.get(appOptions.api + 'edu-groups/' + group + '?access_token=' + this.token, {})
      .done(function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      }).fail(function() {
        if (typeof callback === 'function') {
          callback(null);
        }
      });
  },

  

  getSchool: function(callback) {
    $.get(appOptions.api + 'schools/?access_token=' + this.token, {})
      .done(function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      }).fail(function() {
        if (typeof callback === 'function') {
          callback(null);
        }
      });
  },

  getSchoolProfile: function(id, callback) {
    $.get(appOptions.api + 'schools/' + id + '/?access_token=' + this.token, {})
      .done(function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      }).fail(function() {
        if (typeof callback === 'function') {
          callback(null);
        }
      });
  },

  getSubjects: function(group, callback) {
    $.get(appOptions.api + 'edu-groups/' + group + '/subjects?access_token=' + this.token, {},
      function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      });
  },

  getFinalMarks: function(group, callback) {
    $.get(appOptions.api + 'persons/' + this.model.user.personId_str + '/edu-groups/' +
    group + '/final-marks?access_token=' + this.token, {},
    function(data) {
      // console.log(data);
      if (void 0 !== data) {
        if (typeof callback === 'function') {
          callback(data);
        }
      }
    });
  },

  getPeriods: function(group, callback) {
    $.get(appOptions.api + 'edu-groups/' + group + '/reporting-periods?access_token=' + this.token, {},
      function(data) {
        // console.log(data);
        if (void 0 !== data) {
          var obj = {},
            current = null,
            next = null,
            dateEnd, i,
            now = new Date().getTime();

          for (i = 0; i < data.length; i++) {
            // dateStart = new Date(data[i].start).getTime();
            dateEnd = new Date(data[i].finish).getTime();
            if (now > dateEnd) {
              current = data[i];
            }
          }
          if (current) {
            for (i = 0; i < data.length; i++) {
              if (data[i].number === current.number + 1) {
                next = data[i];
                break;
              }
            }
          }
          obj = { current: current, next: next };
          if (typeof callback === 'function') {
            callback(obj);
          }
        }
      });
  },

  uploadImage: function(fileList, callback) {
    fileList = fileList || [];
    var res = [];

    for (var i = 0; i < fileList.length; i++) {
      $.post(appOptions.api + 'apps/current/files/async/upload/base64/?access_token=' + this.token,
        {
          fileName: fileList[i].name,
          file: fileList[i].file
        },
        function(data) {
          // console.log(data);
          if (void 0 !== data) {
            res.push(data);
            if (res.length === fileList.length) {
              if (typeof callback === 'function') {
                callback(res);
              }
            }
          }
        });
    }
  },

  checkUploadImage: function(fileList, callback) {
    fileList = fileList || [];
    var res = [],
      that = this,
      i = 0;
    var interval = setInterval(function() {
      $.get(appOptions.api + 'files/async/upload/' + fileList[i] + '/?access_token=' + that.token, {},
        function(data) {
          // console.log(data);
          if (void 0 !== data) {
            res.push(data);
            if (res.length === fileList.length) {
              if (typeof callback === 'function') {
                callback(res);
              }
            }
          }
        });
      i++;
      if (i === fileList.length) {
        clearInterval(interval);
      }
    }, 2000);
  },

  addKeyToDB: function(options, callback) {
    options = options || {};
    $.post(appOptions.api + 'storage/keys/?access_token=' + this.token,
      {
        label: options.label,
        key: options.key,
        value: options.value,
        permissionLevel: 'Public'
      },
      function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      });
  },

  deleteKeyFromDB: function(key, callback) {
    key = key || '';
    $.post(appOptions.api + 'storage/keys/' + key + '/delete/?access_token=' + this.token,
      {},
      function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      });
  },

  getKeyFromDB: function(options, callback) {
    options = options || {};
    $.get(appOptions.api + 'storage/keys/' + options.key + '/?access_token=' + this.token, {})
      .done(function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      }).fail(function() {
        if (typeof callback === 'function') {
          callback(null);
        }
      });
  },

  getKeysFromDB: function(options, callback) {
    options = options || {};
    $.get(appOptions.api + 'storage/keys/?access_token=' + this.token,
      {
        label: options.label,
        page_number: options.pageNumber,
        page_size: options.pageSize
      },
      function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      });
  },

  getNextPage: function(url, callback) {
    $.get(url + '&access_token=' + this.token, {},
      function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      });
  },

  getRecursivePage: function(url, callback, resData) {
    resData = resData || { Keys: [] };
    var that = this;

    if (url) {
      $.get(url + '&access_token=' + this.token, {},
        function(data) {
          if (void 0 !== data) {
            resData.Keys = resData.Keys.concat(data.Keys);
            that.getRecursivePage(data.Paging.next, callback, resData);
          }
        });
    } else if (typeof callback === 'function') {
      callback(resData);
    }
  },

  getFriends: function(callback) {
    var that = this;

    this.getFriendsIds(function() {
      that.getFriendsProfiles(function(data) {
        if (typeof callback === 'function') {
          callback(data);
        }
      });
    });
  },

  getFriendsIds: function(callback) {
    var that = this;

    $.get(appOptions.api + 'users/me/friends/?access_token=' + this.token, {},
      function(data) {
        // console.log(data);
        if (void 0 !== data) {
          that.model.friendsId = data;
          if (typeof callback === 'function') {
            callback();
          }
        }
      });
  },

  getProfile: function(userId, callback) {
    var that = this;

    that.model.childrenId = [];
    $.get(appOptions.api + 'users/' + userId + '?access_token=' + this.token, {},
      function(data) {
        // console.log(data);
        if (void 0 !== data) {
          that.model.profile = data;
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      });
  },


  getFriendsProfiles: function(callback) {
    var that = this;

    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify(that.model.friendsId),
      dataType: 'json',
      success: function(data) {
        // console.log(data);
        if (void 0 !== data) {
          that.model.friendsProfiles = data;
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      },
      processData: false,
      type: 'POST',
      url: appOptions.api + 'users/many?access_token=' + this.token
    });
  },

  sendSticker: function(options) {
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify({
        imageUrl: options.imageUrl,
        text: options.text,
        redirectUrl: options.redirectUrl }),
      dataType: 'json',
      success: function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof options.callback === 'function') {
            options.callback();
          }
        }
      },
      processData: false,
      type: 'POST',
      url: appOptions.api + 'users/' + options.id + '/wall/badge?access_token=' + this.token
    });
  },

  sendMessage: function(options, callback) {
    callback();
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify({
        from_str: options.from,
        from: options.from_str,
        to: options.to,
        to_str: options.to_str,
        body: options.body }),
      dataType: 'json',
      success: function(data) {
        // console.log(data);
        if (void 0 !== data) {
          if (typeof options.callback === 'function') {
            options.callback();
          }
        }
      },
      processData: false,
      type: 'POST',
      url: appOptions.api + 'messages/?access_token=' + this.token
    });
  }
};

export { API };
