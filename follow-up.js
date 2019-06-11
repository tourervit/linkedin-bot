console.log('Start chat bot with test string');
var REST_TIME = 500;
var WRITING_TIME = 6000;
var CLICK_TIME = 500;
var CHANGE_PAGE_TIME = 4000;
var OPEN_DIALOG_WAIT_TIME = 2500;

var ACCEPTED_MARKER = 'first';
var SELECTED_MARKER = 'second';

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.code == 'sn.startFollowUp') {
    const sendMessages = [];
    let numberOfMessages = 0;
    let currentLastChat;

    function checkLastMessageInChat(chatList) {
      return new Promise(resolve => {
        let chatsMap = [];
        $.each(chatList, (index, item) => {
          const $chat = $(item);
          const chatLastMessage = $chat.find('.msg-conversation-card__message-snippet-body').text();
          const { testString } = message;
          if (
            chatLastMessage.toLowerCase().indexOf('you:') > -1 &&
            chatLastMessage.toLowerCase().indexOf(testString.toLowerCase()) > -1
          ) {
            chatsMap.push($chat);
          }
        });
        resolve(chatsMap);
      });
    }

    function writeMessage(chatsForMessage) {
      return new Promise(resolve => {
        let index = 0;

        function write() {
          return new Promise(resolve => {
            const messageForSend = formatMessage(message.message, extractProfile(chatsForMessage[index]));
            console.log(messageForSend);
            const $messageField = $('.msg-form__contenteditable p');
            const $btnSend = $('.msg-form__send-button');
            setTimeout(() => {
              $('.msg-form__contenteditable p').sendkeys(messageForSend);
            }, getRandomDelay(2000, 4000));
            setTimeout(() => {
              $btnSend.click();
              numberOfMessages++;
              sendMessages.push({
                name: extractProfile(chatsForMessage[index]),
                message: messageForSend,
              });
              $messageField.val('');
            }, getRandomDelay(4000, 6000));
            resolve();
          });
        }

        function counter() {
          return new Promise(resolve => {
            chatsForMessage[index].find('a')[0].scrollIntoView();
            chatsForMessage[index].find('a')[0].click();
            chatsForMessage[index].addClass('done');
            write().then(() => {
              setTimeout(() => {
                index++;
                resolve();
              }, 6000);
            });
          });
        }

        function checkList() {
          if (index < chatsForMessage.length) {
            counter().then(() => {
              checkList();
            });
          } else {
            resolve();
          }
        }
        checkList();
      });
    }

    const checkChats = () => {
      return new Promise(resolve => {
        let $chat = $('.msg-conversation-listitem:not(.msg-conversation-card--occluded):not(.done)');
        resolve($chat);
      });
    };

    function scroll(item) {
      return new Promise(resolve => {
        const state = item === currentLastChat ? 'end' : 'ok';
        currentLastChat = item;
        setTimeout(() => {
          item.scrollIntoView();
        }, 3000);
        setTimeout(() => {
          resolve(state);
        }, 5000);
      });
    }

    function extractProfile(item) {
      var person = {};
      var $name = $('.msg-conversation-card__participant-names', item);
      person.name = $name.text();
      return person;
    }

    function initBot() {
      checkChats().then(chatsList => {
        checkLastMessageInChat(chatsList).then(chatsMap => {
          if (chatsMap.length) {
            writeMessage(chatsMap).then(() => {
              scroll(chatsList.last()[0]).then(state => {
                if (state === 'end') {
                  closeBot();
                  return null;
                }
                setTimeout(() => {
                  initBot();
                }, CHANGE_PAGE_TIME);
              });
            });
          } else {
            scroll(chatsList.last()[0]).then(state => {
              if (state === 'end') {
                closeBot();
                return null;
              }
              setTimeout(() => {
                initBot();
              }, 2000);
            });
          }
        });
      });
    }

    function closeBot() {
      alert(`Bot finished. \n ${numberOfMessages} messages. \n Full info in console`);
      console.log(numberOfMessages);
      console.log(sendMessages);
    }

    initBot();
  }
});
