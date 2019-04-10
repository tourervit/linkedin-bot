
function formatMessage(msg, profile) {
    var name = profile.name.replace(/\s\s+/g, ' ').trim();
    var split = name.split(" ");
    if (split.length > 0 /*&& split.length < 3*/) {
        name = split[0];
    } else {
        name = "";
    }

    msg = msg.replace("{name}", name);
    return msg;
}



function nextAction(seed, data) {

    var dfd = jQuery.Deferred();

    var finalSeed = Math.round(seed + (seed * 0.2 * Math.random() * (Math.random() > 0.5 ? 1 : -1)));

    setTimeout(function (items) {
        dfd.resolve(data);
    }, seed);

    return dfd.promise();
}
