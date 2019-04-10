console.log('Start chat bot for new connections');
var REST_TIME = 500;
var WRITING_TIME = 6000;
var CLICK_TIME = 500;
var CHANGE_PAGE_TIME = 4000;
var OPEN_DIALOG_WAIT_TIME = 2500;

var ACCEPTED_MARKER = "first";
var SELECTED_MARKER = "second";

chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.code == 'sn.startFollowUpForNew') {
      console.log(message);
      const sendMessages = [];
      let numberOfMessages = 0;
      let currentLastChat;

      function checkNewMessage(chatList) {
        return new Promise((resolve) => {
          let chatsMap = [];
          $.each(chatList, (index, item) => {

            const $chat = $(item);
            const chatLastMessage = $chat.find('.msg-conversation-listitem__message-snippet.msg-conversation-card__message-snippet').text();
            if (chatLastMessage.toLowerCase().indexOf(' is now a connection.') > -1) {

                let date_text = $chat.find('.msg-conversation-listitem__time-stamp').text();
                if(date_text){
                    if(date_text.match(/AM|PM/i)){
                        return true;
                    }
                    let days_ago = 4;
                    days_ago = 1000*60*60*24*days_ago;
                    let year = new Date().getFullYear();
                    let today = new Date().getTime();
                    let date = Date.parse(date_text + ' ' + year);

                  if (date > today) {
                    date = Date.parse(date_text + ' ' + (year  - 1));
                  }
                  if(date && (today - date) < days_ago){
                        return true;
                    }
                }

              chatsMap.push($chat);
            }
          });
          resolve(chatsMap);
        })
      }

      function writeMessage(chatsForMessage) {
        return new Promise(resolve => {
          let index = 0;

          function write() {
            return new Promise(resolve => {
              const messageForSend = formatMessage(message.message, extractProfile(chatsForMessage[index]));
              const $messageField = $('.msg-form__textarea');
              const $messageField2 = $('.msg-form__contenteditable p');
              const $btnSend = $('.msg-form__send-button');
              const newMessageForSend = messageForSend.split('');
              console.log(newMessageForSend);
              if ($messageField.length) {
                $messageField.focus();
                $messageField.blur();
                $messageField.click();
                $messageField.sendkeys(messageForSend);
                setTimeout(() => {
                  $messageField.val('');
                }, 3000);
              } else {
                $messageField2.focus();
                $messageField2.blur();
                $messageField2.click();
                $messageField2.sendkeys(messageForSend);
                setTimeout(() => {
                  $messageField2.val('');
                }, 3000);

              }

              setTimeout(() => {
                $messageField2.val('');
                $messageField.val('');
                $btnSend.click();
                numberOfMessages++;
                sendMessages.push({
                  name: extractProfile(chatsForMessage[index]),
                  message: messageForSend
                });
                resolve();
              }, 4000)
            })
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
                }, 6000)
              });
            })
          }

          function checkList() {
            if (index < chatsForMessage.length) {
              counter()
                .then(() => {
                  checkList();
                });
            } else {
              resolve();
            }
          }

          checkList();
        })
      }

      const checkChats = () => {
        return new Promise(resolve => {
          let $chat = $('.msg-conversation-listitem:not(.msg-conversation-card--occluded):not(.done)');
          resolve($chat);
        })
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
          }, 5000)
        })
      }

      function extractProfile(item) {
        var person = {};
        var $name = $(".msg-conversation-card__participant-names", item);
        person.name = $name.text();
        return person;
      }

      function initBot() {
        checkChats()
          .then(chatsList => {
            checkNewMessage(chatsList)
              .then(chatsMap => {
                if (chatsMap.length) {
                  writeMessage(chatsMap)
                    .then(() => {
                      scroll(chatsList.last()[0])
                        .then((state) => {
                          if (state === 'end') {
                            closeBot();
                            return null;
                          }
                          setTimeout(() => {
                            initBot();
                          }, CHANGE_PAGE_TIME)
                        });
                    });
                } else {
                  scroll(chatsList.last()[0])
                    .then((state) => {
                      if (state === 'end') {
                        closeBot();
                        return null;
                      }
                      setTimeout(() => {
                        initBot();
                      }, 2000);
                    });
                }
              })
          })
      }

      function closeBot() {
        alert(`Bot finished. \n ${numberOfMessages} messages. \n Full info in console`);
        console.log(numberOfMessages);
        console.log(sendMessages)
      }

      initBot();
    }
  }
);
