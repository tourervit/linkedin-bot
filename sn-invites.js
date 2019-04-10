console.info('Start sales navigator bot');

var LOADING_STATUS = 0;
var NOT_EXIST_STATUS = 1;
var EXIST_STATUS = 2;

var REST_TIME = 500;
var WRITING_TIME = 8000;
var CLICK_TIME = 500;
var CHANGE_PAGE_TIME = 4000;
var OPEN_DIALOG_WAIT_TIME = 2500;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.code == 'sn.startInvites') {
    function extractProfile(item) {
      var person = {};
      var $name = $('.name-link.profile-link', item);
      person.name = $name.text();
      person.company = $('.company-name.company-link', item).text();
      var infos = $(item).find('.info p');
      person.position = $(infos[0]).text();
      if (person.company && person.company != '') {
        person.position = person.position + ' at ' + person.company;
      }

      person.location = $(infos[infos.length - 1]).text();
      person.linkedinId = $name
        .attr('href')
        .replace(',', '/')
        .split('/')[3];
      return person;
    }

    function extractSearchCriteria() {
      var searchCriteria = {};
      if ($('li.I .selected-value-pill').length > 1) {
        try {
          var $li = $('li.I .selected-value-pill')[0];
          searchCriteria.industryId = parseInt($($li).data('value'));
          searchCriteria.industryStr = $('.pill-text', $li).text();
        } catch (e) {
          console.info('error during parsing industry');
        }
      }

      searchCriteria.keywords = $('.keywords-input.facet-text-input').val();

      return searchCriteria;
    }

    function hasTries(invites) {
      return invites == -1 || invites > 0;
    }

    function showDialog(added) {
      alert('Bot finished: added ' + added);
    }

    var searchCriteria = extractSearchCriteria();
    var leftInvites = message.max;
    var added = 0;

    function addContactCase(index, sourcesIds, items) {
      console.info('Left ' + (leftInvites == -1 ? ' infinity ' : leftInvites) + ' invites');

      if (!hasTries(leftInvites)) {
        showDialog(added);
        return;
      }

      var dfd = jQuery.Deferred();

      var promise = dfd.promise();

      if (!items) {
        console.info('Initializing items');

        var idsToRequest = [];
        var items = {};
        //injected_main();
        var persons = $('.search-results-container').find('.result.member');

        console.info('Found ' + persons.length + ' contacts');

        persons.map(function(index, item) {
          var person = extractProfile(item);
          idsToRequest.push(person.linkedinId);
          items[person.linkedinId] = item;
        });

        console.info('Request to service to find existing ids ', idsToRequest.length);

        chrome.runtime.sendMessage(
          {
            code: 'sn.checkpeople',
            ids: idsToRequest,
            tag: message.tag,
          },
          function(resp) {
            console.info('Server responds with ', resp);

            var statuses = resp.statuses;
            var foundPeople = [];
            for (var i = 0; i < idsToRequest.length; i++) {
              var linkedInId = idsToRequest[i];
              var statuse = statuses[linkedInId];
              if (statuse) {
                var stat = statuse.status;

                if (stat == NOT_EXIST_STATUS) {
                  foundPeople.push(linkedInId);
                }
              }
            }

            console.info('Left after filtering ' + foundPeople.length);

            dfd.resolve({
              foundPeople: foundPeople,
              items: items,
            });
          },
        );
      } else {
        dfd.resolve({
          foundPeople: sourcesIds,
          items: items,
        });
      }

      promise.then(function(data) {
        var foundPeople = data.foundPeople;
        var items = data.items;

        console.info('Adding contact ' + index);

        var item = items[foundPeople[index]];
        var profile = extractProfile(item);
        profile.tag = message.tag;
        profile.industry = searchCriteria.industryStr;

        nextAction(REST_TIME)
          // click by options
          .then(function() {
            var $action = $('.action-trigger', item);
            var found = $action.length == 1;
            if (found) {
              console.info('Click by options');
              $action.click();
            } else {
              console.info('Options not found');
            }
            return nextAction(CLICK_TIME, found);
          })
          .then(function(found) {
            if (found == true) {
              var $action = $('.action.connect', item);
              if ($action.length == 1) {
                console.info('Click by connect');
                $action.click();
              } else {
                console.info('Connect button not found');
                found = false;
              }
            }
            return nextAction(OPEN_DIALOG_WAIT_TIME, found);
          })
          .then(function(found) {
            if (found == true) {
              var msg = formatMessage(message.inviteMessage, profile);

              $('.connect-body-item.connect-form-container #connect-message-content').val(msg);

              //connect-email-input
              if ($('#connect-email-input').length > 0) {
                found = false;
              }

              // $(".connect-body-item.connect-action-container .submit-button").click()
            }
            if (found) {
              return nextAction(WRITING_TIME, found);
            } else {
              return nextAction(REST_TIME, found);
            }
          })
          .then(function(found) {
            if (found) {
              $('.connect-body-item.connect-action-container .submit-button').click();

              chrome.runtime.sendMessage(
                {
                  code: 'sn.addperson',
                  profile: profile,
                  criteria: searchCriteria,
                },
                function(resp) {
                  console.info('user saved', profile.name);
                },
              );

              if (leftInvites != -1) {
                leftInvites = leftInvites - 1;
                added++;
              }
            } else {
              console.info('Cancel invite dialog');
              var $connect = $('.connect-body-item.connect-action-container .cancel-button');
              if ($connect.length > 0) {
                $connect.click();
              }
            }

            index++;
            if (index >= foundPeople.length) {
              console.info('All user processed');
              console.info('Trying to change page');
              var pagination = document.querySelector('.next-pagination.page-link');
              if (pagination) {
                console.info('Page changed');
                pagination.click();
                nextAction(CHANGE_PAGE_TIME).then(function() {
                  return addContactCase(0);
                });
              } else {
                console.info('Pages finished');
                showDialog(added);
              }
            } else {
              return addContactCase(index, foundPeople, items);
            }
          });
      });
    }
    addContactCase(0);
  }
});

function nextPage() {
  var pagination = $('a.next-pagination.page-link');
  if (pagination.length == 1 && !pagination.hasClass('disabled')) {
    $('a.next-pagination.page-link .pagination-text').click();
    return true;
  } else {
    return false;
  }
}
