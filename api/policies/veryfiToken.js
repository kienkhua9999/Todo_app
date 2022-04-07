/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: TODO: You might write a short summary of how this policy works and what it represents here.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
 TOKEN = function (len) {
  var token = [];
  var bcrypts = "ZAQWSXEDCRFVTGBYHNUJMNIKOLlokimjunhybgtvfrcdexswzaq0987654321";
  var bcryptsLen = bcrypts.length;

  for (var i = 0; i < len; ++i) {
    token.push(bcrypts[getRandomInt(0, bcryptsLen - 1)]);
  }

  return token.join("");
};
module.exports = async function (req, res, next) {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.slice(7);
    try {
      var checkAcToken = await AccessToken.findOne({ token: token });
      if (!checkAcToken) {
        return res.json({ message: 'Token is not valid!' });
      }
      var checkUser = await User.findOne({ id: checkAcToken.owner });
      if (!checkUser) {
        return res.json({ message: "You're not allowed to do that!" });
      }
      req.userID = checkUser.id;
      var checkRfToken = await RefreshToken.findOne({ owner: checkAcToken.owner });
      if (!checkRfToken) {
        return res.json({ message: "You're not allowed to do that!" });
      }
      const time = new Date();
      if (checkRfToken.timeCreate + checkRfToken.time < time.getTime()) {
        await AccessToken.destroy({ owner: checkAcToken.owner });
        await RefreshToken.destroy({ owner: checkAcToken.owner });
        return res.json({ message: 'Login expired, login again' });
      }
      req.updateToken = false;
      if (checkAcToken.timeCreate + checkAcToken.time < time.getTime()) {
        var newAcToken = TOKEN(60);
        accessToken.update(checkAcToken.owner, newAcToken, time.getTime());
        req.newAcToken = newAcToken;
        req.updateToken = true;
      }


      return next();
    } catch (e) {
      return res.json({ message: 'Error' + e.error });
    }
  } else {
    return res.json({ message: "You're not authenticated "});
  }
};
