import '../../node_modules/jquery-modal/jquery.modal.js';
import { API } from './api';
import { Auth } from './auth.js';
import infoData from './infoData.js';


// vars
const infoBlock = $('.info');
const articleBlock = $('.article');
const btnTop = $('.article__btn_top');
const btnBottom = $('.article__btn_bottom');

let activeChild;
let activeSubject = null;
let activeColor = ['#235B92', '#16335F'];


if (document.location.href.indexOf('access_token') > -1) {
  Auth.auth(function() {
    API.token = Auth.token;
    //API.getUserInfo();
    var path = window.location.pathname.substring(0, window.location.pathname.length);

    history.pushState('', document.title, path);
    window.location.reload();
  });
}


// on select subject event evitter
$('.partion__list').on('click', (ev) => {
  ev.preventDefault();
  console.log('click');
  const target = $(ev.target);
  if (target.parent().hasClass('partion__item')) {
    activeSubject = target.closest('.partion__item').data('type');
    activeSubject = activeSubject || 'g';
    if(activeSubject === 'e') { // естественные 
      activeColor = ['#62BAA8', '#1abc9c'];
    } else if (activeSubject === 't') { // технические 
      activeColor = ['#fff', '#575858'];
    } else if (activeSubject === 'g') { // гуманитарные
      activeColor = ['#235B92', '#16335F'];
    }
    infoBlock.css('background-image', `radial-gradient(ellipse farthest-corner at right center, ${activeColor[0]} 0%, ${activeColor[1]} 100%)`);
    const mainInfo = {
      children: []
    }; // initial main object  
    //Auth.auth(() => { 
      //API.init();   // аутентификация и инициализация апи
      
      API.init();
      //window.location.hash = url.split('?')[0];
      API.getUserInfo().then((res) => {
        const roles = API.getData().user.roles;
        const isParent = roles.find(role => {
          return role === 'EduParent';
        });
        if (!isParent) { // проверка на родителя
          $('#modal-parent').modal({
            fadeDuration: 250,
            fadeDelay: 1.5
          });
          $('.parent__title').html('Только для родителей !');
          throw Error('только для родителей');
        } else {
          return API.getChildren();
        }
      }).then((res) => {  //получаем список детей пользователя
        var kids = API.getData().childrenId;
        var kidsId = [];
        kids.forEach(child => {
          kidsId.push(child.userId);
        });
        return API.getSeveralUserInfo(kidsId); // получаем инфо о детях
      }).then((data) => {
        console.log(data);
        data.forEach(child => {
          if (calculateAge(child.birthday) >= 7) { // проверка на детский возраст
            mainInfo.children.push({
              id: child,
              class: null,
              t: {items: [], mark: null},
              e: {items: [], mark: null},
              g: {items: [], mark: null}
            });
          }
        });
        if (mainInfo.children.length == 0) { // если нет детей по возрасту то предупреждение
          $('#modal-parent').modal({
            fadeDuration: 250,
            fadeDelay: 1.5
          });
          $('.parent__title').html('Нет детей школьного возраста !');
          throw Error('Нет детей школьного возраста');
        }
        const promises = [];
        for (let i = 0; i < mainInfo.children.length; i++) { // получаем предметы
          let promise = API.getEduGroup(mainInfo.children[i].id.personId);
          promise.then((data) => {
            console.log(data);
            let groups = data.filter((group) => {
              return group.type == 'Group';
            });
            mainInfo.children[i].class = groups[0];
            mainInfo.children[i].class.subjects.forEach(subject => { // распределение предметов по группам
              if (subject.knowledgeArea === 'Математика' ||
                subject.knowledgeArea === 'Алгебра' ||
                subject.knowledgeArea === 'Геометрия' ||
                subject.knowledgeArea === 'Технология') {
                mainInfo.children[i].t.items.push({
                  id: subject.id_str,
                  name: subject.name
                });
              }
              if (subject.knowledgeArea === 'Естествознание') {
                mainInfo.children[i].e.items.push({
                  id: subject.id_str,
                  name: subject.name
                });
              }
              if (subject.knowledgeArea === 'Филология' ||
                subject.knowledgeArea === 'Социальные науки') {
                mainInfo.children[i].g.items.push({
                  id: subject.id_str,
                  name: subject.name
                });
              }
            });

          });
          promises.push(promise);
        }
        return Promise.all(promises);
      }).then(() => {
        const promises = [];
        for (let i = 0; i < mainInfo.children.length; i++) { // получаем оценки за период по предметам
          let promise = API.getMarksFromPeriod(mainInfo.children[i].t.items, '2017-01-01T00:00:00', '2017-06-31T00:00:00', mainInfo.children[i].id.personId).then(data => {
            const tMarks = [];
            data.forEach(elem => {
              elem.data.forEach(mark => {
                tMarks.push(+mark.value);
              });
            });
            mainInfo.children[i].t.mark = +average(tMarks);
          }).then(() => {
            return API.getMarksFromPeriod(mainInfo.children[i].e.items, '2017-01-01T00:00:00', '2017-06-31T00:00:00', mainInfo.children[i].id.personId).then(data => {
              const eMarks = [];
              data.forEach(elem => {
                elem.data.forEach(mark => {
                  eMarks.push(+mark.value);
                });
              });
              mainInfo.children[i].e.mark = +average(eMarks);
            })
          }).then(() => {
            return API.getMarksFromPeriod(mainInfo.children[i].g.items, '2017-01-01T00:00:00', '2017-06-31T00:00:00', mainInfo.children[i].id.personId).then(data =>{
              const gMarks = [];
              data.forEach(elem => {
                elem.data.forEach(mark => {
                  gMarks.push(+mark.value);
                });
              });
              mainInfo.children[i].g.mark = +average(gMarks);
            });
          });
          promises.push(promise);
        }
        return Promise.all(promises);
      }).then(() => {
        if (mainInfo.children.length > 1) { // если детей больше одного то выбор
          const modal = $('#modal-child');
          $('.child__content').html(''); 
          mainInfo.children.forEach((child, indx) => {
            $('.child__content').append(
              `<li class="childe__item" data-number="${indx}">
                <input type="radio" id="child${indx}" name="child" value="${indx}">
                <label for = "child${indx}"> ${child.id.firstName} </label>
              </li>
              `
            );
          });
          $('.child__content').one('click', (ev) => {
            ev.preventDefault();
            const target = $(ev.target);
            activeChild = target.closest('.childe__item').data('number');
            $.modal.close();
          });
          modal.modal({
            fadeDuration: 250,
            fadeDelay: 1.5
          });
          modal.on($.modal.CLOSE, function(event, modal) {
            if(typeof activeChild !== 'undefined') {
              infoBlock.show();
              articleBlock.show();
              renderData(activeSubject, mainInfo.children[activeChild][activeSubject].mark);
              setTimeout(() => {
                showData(mainInfo);
              }, 1500);
              $('body,html').animate({scrollTop: $('.marks').offset().top}, 1500);
              // console.log(mainInfo);  !! result object
            }
          });

        } else {
          infoBlock.show();
          articleBlock.show();
          console.log('children', mainInfo.children);
          activeChild = 0;
          renderData(activeSubject, mainInfo.children[activeChild][activeSubject].mark);
          setTimeout(() => {
            showData(mainInfo);
          }, 1500);
          $('body,html').animate({scrollTop: $('.marks').offset().top}, 1500);
          console.log(mainInfo);
        }

      }).catch(error => {
        console.log(error);
      });
    //});
  }
});

function average(arr) { // средняя оценка
  var sum = 0;
  for (var i = 0; i < arr.length; i++ ) {
    sum += arr[i];
  }
  if (sum == 0) {
    return sum;
  } else {
    sum = sum / arr.length;
    return sum.toFixed(1);
  }
}
function showData(mainInfo) {  // вывод средних оценок
  const mark = mainInfo.children[activeChild][activeSubject].mark || 'нет данных';
  $('.marks').css('background-color', '#e0dfdf');
  $('.mark__title').text('Средний балл в данной области: ');
  $('.mark__mark').html(mark);
}

function renderData(activeSubject, score) { // проверка оценок
  let level = 'low';

  if (score < 3.9) {
    level = 'low';
  } else if (score > 4.0 && score < 4.4) {
    level = 'mid';
  } else if (score > 4.5 && score < 5.0) {
    level = 'high';
  }

  const renderData = infoData[activeSubject][level];
  $('.info__title > .title').html(renderData.title);
  renderData.data.forEach((elem, indx) => {
    let wrapper = $(`.text__item_${indx}`);
    wrapper.find('.texts__title').html(elem.title);
    wrapper.find('.texts__content').html(elem.text);
  });
  // set link 
  btnTop.attr('onClick', `${renderData.ga};${renderData.ym};window.open("${renderData.utm}");`);
  btnBottom.attr('onClick', `${infoData.bottom.ga};${infoData.bottom.ym};window.open("${infoData.bottom.utm}")`);
}

function calculateAge(birthday) { // расчет возраста от даты рождения
  let date = birthday.split('T');
  date = date[0].split('-');
  const ageDifMs = Date.now() - new Date(date[0], date[1], date[2]);
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
