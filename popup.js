function clickSNInviteHandler(e) {
  var newVar = {
    code: 'sn.startInvites',
    inviteMessage: document.getElementById('inviteMessage').value,
    tag: document.getElementById('company').value,
    max: document.getElementById('max').value,
  };

  console.info('Invite Bot started with message', newVar);

  chrome.tabs.query({ active: true, currentWindow: true }, function(d) {
    chrome.tabs.sendMessage(d[0].id, newVar);
    window.close();
  });
}

function clickLIInviteHandler(e) {
  var newVar = {
    code: 'sn.startLIInvites',
    inviteMessage: document.getElementById('liInviteMessage').value,
    max: document.getElementById('liMax').value,
  };

  chrome.tabs.query({ active: true, currentWindow: true }, function(d) {
    chrome.tabs.sendMessage(d[0].id, newVar);
    window.close();
  });
}

function clickMessageHandler(e) {
  var e = document.getElementById('activity');
  var activity = e.options[e.selectedIndex].value;

  var newVar = {
    code: 'sn.startChat',
    message: document.getElementById('sendMessage').value,
    activity: activity,
  };

  console.info('Chat Bot started with message', newVar);

  chrome.tabs.query({ active: true, currentWindow: true }, function(d) {
    chrome.tabs.sendMessage(d[0].id, newVar);
    window.close();
  });
}

function clickMessageWithTextHandler(e) {
  var newVar = {
    activity: 'first',
    code: 'sn.startFollowUp',
    testString: document.getElementById('test-string').value,
    message: document.getElementById('new-message').value,
  };

  console.info('Chat Bot started with params:', newVar);

  chrome.tabs.query({ active: true, currentWindow: true }, function(d) {
    chrome.tabs.sendMessage(d[0].id, newVar);
    window.close();
  });
}

function clickMessageForNewHandler(e) {
  var newVar = {
    activity: 'first',
    code: 'sn.startFollowUpForNew',
    message: document.getElementById('new-message-for-new').value,
  };

  console.info('Chat Bot started with params:', newVar);

  chrome.tabs.query({ active: true, currentWindow: true }, function(d) {
    chrome.tabs.sendMessage(d[0].id, newVar);
    window.close();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('startSNInvites').addEventListener('click', clickSNInviteHandler);

  document.getElementById('startLIInvites').addEventListener('click', clickLIInviteHandler);

  document.getElementById('showInviteBtn').addEventListener('click', function() {
    document.getElementById('buttons').style = 'display:none';
    document.getElementById('inviteConfig').style = '';
  });

  document.getElementById('showInviteBtn').addEventListener('click', function() {
    document.getElementById('buttons').style = 'display:none';
    document.getElementById('inviteConfig').style = '';
  });

  document.getElementById('showLIInviteBtn').addEventListener('click', function() {
    document.getElementById('buttons').style = 'display:none';
    document.getElementById('liInviteConfig').style = '';
  });

  document.getElementById('showMessagesBtn').addEventListener('click', function() {
    document.getElementById('buttons').style = 'display:none';
    document.getElementById('messageConfig').style = '';
  });

  document.getElementById('showFollowUpBtn').addEventListener('click', function() {
    document.getElementById('buttons').style = 'display:none';
    document.getElementById('followUpConfig').style = '';
  });

  // document.getElementById('showFollowForNewUpBtn').addEventListener('click', function() {
  //   document.getElementById('buttons').style = 'display:none';
  //   document.getElementById('followUpForNewConfig').style = '';
  // });

  document.getElementById('startChat').addEventListener('click', clickMessageHandler);
  document.getElementById('startFollowUp').addEventListener('click', clickMessageWithTextHandler);
  document.getElementById('startFollowUp-for-new').addEventListener('click', clickMessageForNewHandler);
});
