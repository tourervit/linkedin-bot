console.log('Start chat bot with smart string');
var REST_TIME = 500;
var WRITING_TIME = 6000;
var CLICK_TIME = 500;
var CHANGE_PAGE_TIME = 4000;
var OPEN_DIALOG_WAIT_TIME = 2500;

var ACCEPTED_MARKER = 'first';
var SELECTED_MARKER = 'second';

const today = new Date();
const todayInMs = today.setHours(0, 0, 0, 0);
const todayYear = today.getFullYear();

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
          const chatLastMessage = $chat
            .find('.msg-conversation-card__message-snippet-body')
            .text()
            .toLowerCase();
          const lastMessageTimeStamp = $chat.find('.msg-conversation-card__time-stamp').text();
          const lastMessageDateInMs =
            lastMessageTimeStamp.indexOf(':') > -1
              ? todayInMs
              : new Date(`${lastMessageTimeStamp} ${todayYear}`).getTime();

          const dayDiff = (todayInMs - lastMessageDateInMs) / 86400000;

          const { testString } = message;
          const lastMessageFromMeAndWasSentDaysAgo =
            (chatLastMessage.indexOf('you:') > -1 || chatLastMessage.charAt(0) === ':') && dayDiff >= 3;

          if (testString) {
            if (
              lastMessageFromMeAndWasSentDaysAgo &&
              chatLastMessage.indexOf(testString.toLowerCase()) > -1
            ) {
              chatsMap.push($chat);
            }
          } else {
            if (lastMessageFromMeAndWasSentDaysAgo) {
              chatsMap.push($chat);
            }
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
            const $messageField = $('.msg-form__contenteditable p');
            const $btnSend = $('.msg-form__send-button');
            if ($('.msg-s-message-list-content').find('li.msg-s-message-list__event').length === 1) {
              // console.log('There is no answer, so we are gonna send a follow-up message');
              setTimeout(() => {
                $messageField.sendkeys(messageForSend);
              }, 2000);
              setTimeout(() => {
                if ($('.msg-form__contenteditable p').text().length === messageForSend.length) {
                  // console.log('MESSAGE FROM TEXT FIELD', $messageField.text());
                  // $btnSend.click();

                  numberOfMessages++;
                  sendMessages.push({
                    name: extractProfile(chatsForMessage[index]),
                    message: messageForSend,
                  });

                  $messageField.text('');
                  // console.log($messageField.text());
                }
              }, 4000);
            }
            resolve();
          });
        }

        function counter() {
          return new Promise(resolve => {
            chatsForMessage[index].find('a')[0].scrollIntoView();
            chatsForMessage[index].find('a')[0].click();
            chatsForMessage[index].addClass('done');
            setTimeout(() => {
              write().then(() => {
                setTimeout(() => {
                  index++;
                  resolve();
                }, 6000);
              });
            }, 5000);
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
      const person = {};
      const $name = $('.msg-conversation-card__participant-names', item);
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
