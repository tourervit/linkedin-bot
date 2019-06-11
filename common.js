function formatMessage(msg, profile) {
  let firstName;
  let fullName = profile.name.toLowerCase();
  const garbage = [
    'mr.',
    'ms.',
    'mrs.',
    'dr.',
    'lord',
    'esq.',
    'jr.',
    'messrs',
    'mmes.',
    'msgr.',
    'prof.',
    'rev.',
    'rt.',
    'hon.',
    'sr.',
    'st.',
    'ph.d',
    'phd',
  ];
  garbage.forEach(junk => {
    fullName = fullName.replace(junk, '').trim();
  });
  fullName = fullName
    .replace(
      /[`~!@#$%^&*()_|+\=?;:'",.<>\{\}\[\]\\\/\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/gi,
      '',
    )
    .trim();

  // After removing garbage, take the first word which is obviously the first name
  firstName = fullName.includes(' ') ? fullName.split(' ')[0] : fullName;

  // if it's a double name, like Jean-Baptiste, split it into array, capitalize each of othem and join together with '-'
  if (firstName.includes('-')) {
    const doubleName = firstName.split('-').map(name => name.charAt(0).toUpperCase() + name.slice(1));
    firstName = doubleName.join('-');
    // if it's a regular name
  } else {
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }
  msg = msg.replace('{name}', firstName);
  return msg;
}

function nextAction(seed, data) {
  var dfd = jQuery.Deferred();

  var finalSeed = Math.round(seed + seed * 0.2 * Math.random() * (Math.random() > 0.5 ? 1 : -1));

  setTimeout(function(items) {
    dfd.resolve(data);
  }, seed);

  return dfd.promise();
}

function removeJunk(name, garbage) {
  let fullName = name.toLowerCase();
  garbage.forEach(junk => {
    fullName = fullName.replace(junk, '').trim();
  });
  firstName = fullName.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
