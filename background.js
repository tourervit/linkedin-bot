var alreadyExists = {};


var LOADING_STATUS = 0;
var NOT_EXIST_STATUS = 1;
var EXIST_STATUS = 2;
var HOST = "http://linkedinapi.sbs.java.magora.team";

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.code == "sn.checkpeople") {


            var reqParams = message.ids
                .map(function (item) {
                    return "ids=" + item;
                })
                .join("&");

            if (message.tag && message.tag != '') {
                reqParams = reqParams + "&tag=" + message.tag;
            }

            $.get(HOST + "/internalapi/peoples/status?" + reqParams, function (data) {
                sendResponse({
                    statuses: data.data
                });

            });
            return true;

        } else if (message.code == "sn.addperson") {

            var value = message.profile;
            console.info("new message", value);

            value.keywords = message.criteria.keywords || "";
            value.industryId = message.criteria.industryId || "";

            $.ajax({

                type: "POST",

                url: HOST + "/internalapi/peoples",

                data: JSON.stringify(value),
                contentType: "application/json; charset=utf-8",
                success: function () {
                },

                dataType: "json"
            });


        }//end if
    }
);//end function
