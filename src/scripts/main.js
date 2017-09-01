import '../../node_modules/jquery-modal/jquery.modal.js';
import { API } from './api';
import { Auth } from './auth.js';
import infoData from './infoData.js';


// vars
const infoBlock = $('.info');
const articleBlock = $('.article');

let activeChild = 0;
let activeSubject = null;


// on select subject event evitter
$('.partion__list').on('click', (ev) => {
  ev.preventDefault();
  const target = $(ev.target);
  if (target.parent().hasClass('partion__item')) {
    activeSubject = target.closest('.partion__item').data('type');
    activeSubject = activeSubject || 'e';
    console.log('click');
    const mainInfo = {
      children: []
    }; // initial main object  
    Auth.auth(() => {
      API.init();
      API.getUserInfo().then((res) => {
        const roles = API.getData().user.roles;
        const isParent = roles.find(role => {
          return role === 'EduParent';
        });

        if (!isParent) { // test for parent
          $('#modal-parent').modal({
            fadeDuration: 250,
            fadeDelay: 1.5
          });
          $('.parent__title').html('Только для родителей !');
          throw Error('только для родителей');
        } else {
          return API.getChildren();
        }
      }).then((res) => {  //get all children
        
              var kids = API.getData().childrenId;

              kids.forEach(child => {
                mainInfo.children.push({
                    id: child,
                    class: null,
                    t: {items: [], mark: null},
                    e: {items: [], mark: null},
                    g: {items: [], mark: null}
                  });
              });
              const promises = [];
              for(let i = 0; i < mainInfo.children.length; i++) { // get subjects
                 let promise = API.getEduGroup(mainInfo.children[i].id.id);
                 promise.then((data) => {
                  let groups = data.filter((group) => {
                    return group.type == 'Group';
                  });
                  mainInfo.children[i].class = groups[0];
                  mainInfo.children[i].class.subjects.forEach(subject => { // select knowledge area
                      if (subject.knowledgeArea === 'Математика' ||
                        subject.knowledgeArea === 'Алгебра' ||
                        subject.knowledgeArea === 'Геометрия' ||
                        subject.knowledgeArea === 'Технология') {
                          mainInfo.children[i].t.items.push({
                            id: subject.id_str,
                            name: subject.name
                          })
                      }
                      if (subject.knowledgeArea === 'Естествознание') {
                        mainInfo.children[i].e.items.push({
                          id: subject.id_str,
                          name: subject.name
                        })
                      }
                      if (subject.knowledgeArea === 'Филология' ||
                        subject.knowledgeArea === 'Социальные науки') {
                          mainInfo.children[i].g.items.push({
                            id: subject.id_str,
                            name: subject.name
                          })
                      }
                  });

                });
                 promises.push(promise);
              }

              return Promise.all(promises);
      }).then(() => {
        
        const promises = [];
        for (let i = 0; i < mainInfo.children.length; i++) { //get marks
          let promise = API.getMarksFromPeriod(mainInfo.children[i].t.items, '2016-09-01T00:00:00', '2017-02-01T00:00:00', mainInfo.children[i].id.id).then(data => {
            const tMarks = [];
            console.log('test');
            data.forEach(elem => {
              elem.data.forEach(mark => {
                tMarks.push(+mark.value);
              });
            });
            mainInfo.children[i].t.mark = +average(tMarks);
          }).then(() => {
            //return setTimeout(() => {
              return API.getMarksFromPeriod(mainInfo.children[i].e.items, '2016-09-01T00:00:00', '2017-02-01T00:00:00', mainInfo.children[i].id.id).then(data => {
                const eMarks = [];
                data.forEach(elem => {
                  elem.data.forEach(mark => {
                    eMarks.push(+mark.value);
                  });
                });
                mainInfo.children[i].e.mark = +average(eMarks);
              })
            
            //}, 100);
          }).then(() => {
            //return setTimeout(() => {
            return API.getMarksFromPeriod(mainInfo.children[i].g.items, '2016-09-01T00:00:00', '2017-02-01T00:00:00', mainInfo.children[i].id.id).then(data =>{
              const gMarks = [];
              data.forEach(elem => {
                elem.data.forEach(mark => {
                  gMarks.push(+mark.value);
                });
              });
              mainInfo.children[i].g.mark = +average(gMarks);
            });
          //}, 100);
          });
          promises.push(promise);
        }
        
        return Promise.all(promises);
      
      }).then(() => {
        if (mainInfo.children.length > 1) {
          const modal = $('#modal-child');
          $('.child__content').html(''); 
          mainInfo.children.forEach((child, indx) => {
            $('.child__content').append(
              `<li class="childe__item" data-number="${indx}">
                <input type="radio" id="child${indx}" name="child" value="${indx}">
                <label for = "child${indx}"> ${child.id.firstName} </label>
              </li>
              `
            )
          })
          $('.child__content').one('click', (ev) => {
            ev.preventDefault();
            console.log('clikc');
            const target = $(ev.target);
            activeChild = target.closest('.childe__item').data('number');
            console.log('child', activeChild);
            $.modal.close();
          });
          modal.modal({
            fadeDuration: 250,
            fadeDelay: 1.5
          });
          modal.on($.modal.CLOSE, function(event, modal) {
            infoBlock.show();
            articleBlock.show();
            renderData(activeSubject, mainInfo.children[activeChild][activeSubject].mark);
            setTimeout(() => {
              showData(mainInfo);
            },1500);
            $('body,html').animate({scrollTop: infoBlock.offset().top}, 1500);
            console.log(mainInfo);
          });
          
        } else {
          infoBlock.show();
          articleBlock.show();
          renderData(activeSubject, mainInfo.children[activeChild][activeSubject].mark);
          setTimeout(() => {
            showData(mainInfo);
          },1500);
          $('body,html').animate({scrollTop: infoBlock.offset().top}, 1500);
          console.log(mainInfo);
        }
        // childrens popup
       
        
        
        
      }).catch(error => {
        console.log(error);
      });
    });
  };
});

function average(arr) {
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
function showData (mainInfo) {
  //const e = mainInfo.children[activeChild].e.mark;
  //const t = mainInfo.children[activeChild].t.mark;
  //const g = mainInfo.children[activeChild].g.mark;
    const mark = mainInfo.children[activeChild][activeSubject].mark || 'нет данных';
    console.log(mark)
    $('.mark__title').text('Средний балл в данной области');
    $('.mark__mark').html(mark);
}

function renderData (activeSubject, score) {
  let level = 'low';
  
  if (score < 3.9) {
    level = 'low';
  } else if (4.0 < score && score < 4,4) {
    level = 'mid';
  } else if (4,5 < score && score < 5.0) {
    level = 'high';
  }
  
  const renderData = infoData[activeSubject][level];
  $('.info__title > .title').html(renderData.title)
  renderData.data.forEach((elem, indx) => {
    let wrapper = $(`.text__item_${indx}`);
    wrapper.find('.texts__title').html(elem.title);
    wrapper.find('.texts__content').html(elem.text);
  })
  
}

