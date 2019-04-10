console.info("Start Chat Sales navigator bot");

var REST_TIME = 500;
var WRITING_TIME = 6000;
var CLICK_TIME = 500;
var CHANGE_PAGE_TIME = 4000;
var OPEN_DIALOG_WAIT_TIME = 2500;

var ACCEPTED_MARKER = "first";
var SELECTED_MARKER = "second";


chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.code == "sn.startChat") {


            function selectThreads() {
                /*var selector = "li";
                 if (activity == SELECTED_MARKER) {
                 selector += ".unread";
                 } else if (activity == ACCEPTED_MARKER) {
                 selector += ".invitation-accepted";
                 }*/
                var selector = $(".msg-conversations-container__conversations-list .pname").closest(".msg-conversation-listitem");
                return $(selector);
            }


            function extractProfile(item) {
                var person = {};
                var $name = $(".msg-conversation-card__participant-names", item);
                person.name = $name.text();
                return person;
            }


            function showDialog() {
                alert("Bot finished");
            }

            console.info("Received command to start chat");


            var threads = selectThreads();

            console.info("Found " + threads.length + " threads with activity - " + message.activity);

            var thread = null;
            var index = -1;
            var nextThread = function () {
                if (threads.length > (index + 1)) {
                    index++;
                    console.info("Next thread");
                    thread = $(threads[index]);
                    nextAction(500).then(function () {
                        console.info("Click by thread, index " + index);
                        thread.find(".msg-conversation-card__participant-names").click();
                        return nextAction(CLICK_TIME);
                    })
                        .then(function () {
                            $("#compose-message").click();
                            return nextAction(CLICK_TIME);
                        })
                        .then(function () {
                            var prf = extractProfile(thread);
                            $(".msg-compose-form__message-text").sendkeys(formatMessage(message.message, prf));
                            return nextAction(WRITING_TIME);
                        })
                        .then(function () {
                            $(".msg-compose-form__send-button").click();
                            return nextAction(CLICK_TIME);
                        })
                        .then(nextThread)

                } else {
                    if (message.activity != SELECTED_MARKER) {
                        console.info("Threads finished, will check next page");
                        var threads2scroll = selectThreads();
                        nextAction(1).then(function () {
                            console.info("Change page");
                            var lastInThread = threads2scroll[threads2scroll.length - 1];
                            console.info("Scroll to last item", lastInThread);
                            lastInThread.scrollIntoView(true);
                            return nextAction(CHANGE_PAGE_TIME);
                        }).then(function () {

                            if (threads2scroll.length == selectThreads().length) {
                                console.info("Page finished");
                                alert("Bot finished");
                            } else {
                                console.info("Next page exists");
                                threads = selectThreads(message.activity);
                                nextThread();
                            }
                        });
                    } else {
                        console.info("Page finished");
                        alert("Bot finished");
                    }
                    // alert("Bot finished");
                }

            };
            nextThread();


        }
    }
);
