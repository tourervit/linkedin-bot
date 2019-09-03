const garbage = ['dr.', 'lord', 'mr.', 'mc'];
console.info('Start LI invite sender bot New');

var LOADING_STATUS = 0;
var NOT_EXIST_STATUS = 1;
var EXIST_STATUS = 2;

var REST_TIME = 1000;
var WRITING_TIME = 8000;
var CLICK_TIME = 500;
var CHANGE_PAGE_TIME = 4000;
var OPEN_DIALOG_WAIT_TIME = 2500;

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
  if (message.code === 'sn.startLIInvites') {
    console.info('Start LI Invites bot');

    let count = 0;
    const statistics = [];
    const header = document.querySelector('header#extended-nav');

    function delay(max, min) {
      const time = randomInteger(min, max);
      console.log(time);
      return new Promise(resolve => {
        setTimeout(resolve, time);
      });
    }

    function extractProfile(item) {
      var person = {};
      var el = $(item);
      person.name = el.find('span.name').text();
      return person;
    }

    async function handleClickAddNote() {
      await delay(1000, 1000);

      const addNotBtn = $('.artdeco-modal__actionbar').find('.artdeco-button--secondary.mr1');
      // const closeBtn = $('.send-invite__header').find('.send-invite__cancel-btn');

      // if (addNotBtn.text().trim().toLowerCase() !== 'add a note') {
      // 	closeBtn.click();
      // 	Promise.reject('Add note button not found');
      // }

      addNotBtn.click();
    }

    async function fillField(field, message, profile) {
      await delay(2000, 2000);

      const formattedMessage = formatMessage(message, profile);
      field.sendkeys(formattedMessage);
    }

    async function nextPage() {
      let pagination = $('.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button');

      if (!pagination.length) {
        pagination = $('.results-paginator .next');
      }

      pagination[0].scrollIntoView({
        behavior: 'smooth',
      });
      await delay(1000, 1000);
      if (pagination.length == 1 && !pagination.hasClass('disabled')) {
        pagination.click();
      } else {
        Promise.reject('No more pages');
      }
    }

    async function sendMessage(item) {
      item.scrollIntoView({ behavior: 'smooth' });
      await delay(500, 500);
      // window.scrollBy({ top: -52, behavior: 'smooth' });

      const profile = extractProfile(item);
      const btn = $(item).find('.search-result__actions--primary');

      if (
        btn
          .text()
          .trim()
          .toLowerCase() !== 'connect'
      ) {
        return;
      }

      try {
        await delay(3000, 5000);
        $(btn).click();

        // if LinkedIn asking for type in user's email - return
        await delay(1000, 2000);
        if (document.querySelector('input#email')) {
          $('.artdeco-modal__dismiss').click();
          return;
        }

        await handleClickAddNote();
        const textField = $('.send-invite__custom-message');

        await fillField(textField, message.inviteMessage, profile);
        const sendBtn = $('.artdeco-modal__actionbar').find('.artdeco-button--3.ml1');
        // const sendBtn = $('.artdeco-modal__dismiss');

        await delay(3000, 6000);
        $(sendBtn).click();

        count += 1;
        const fullName = $(item)
          .find('.name.actor-name')
          .text();

        statistics.push(`${count}) ${fullName} - ${new Date()}`);

        await delay(1000, 1000);
      } catch (e) {
        throw e;
      }
    }

    async function runInvites() {
      header.style.display = 'none';
      window.scrollTo(0, document.body.scrollHeight);
      await delay(2000, 2000);
      const list = $('.search-entity');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await delay(2000, 2000);

      for (let i = 0; i < list.length; i++) {
        try {
          await sendMessage(list[i]);
          if (Number(message.max) > 0 && count >= parseInt(message.max)) {
            download(statistics.toString().replace(/,/g, '\n'), `statistics-${new Date().getTime()}`, 'txt');
            header.style.display = 'block';
            return Promise.reject('complete');
          }
        } catch (e) {
          console.log(e);
          $(items[i]).css('background-color', 'red');
        }
      }

      await nextPage();
      await delay(5000, 5000);

      try {
        await runInvites();
      } catch (e) {
        alert(e);
      }
    }

    try {
      await runInvites();
    } catch (e) {
      alert(e);
    }
  }
});

function download(data, filename, type) {
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement('a'),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

function randomInteger(min, max) {
  var rand = min + Math.random() * (max + 1 - min);
  rand = Math.floor(rand);
  return rand;
}
