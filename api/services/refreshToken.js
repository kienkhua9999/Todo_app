const d = new Date();

exports.create = async function (userID, token, time, secret) {
  try {
    await RefreshToken.create({
      token: token,
      time: time,
      timeCreate: d.getTime(),
      clientSecret: secret,
      owner: userID
    });
  } catch (e) {
    console.log(e.error);
  }
};

exports.update = async function (userID, token) {
  try {
    await RefreshToken.update({ owner: userID })
      .set({
        token: token,
        timeCreate: d.getTime(),
        owner: userID
      });
  } catch (e) {
    console.log(e.error);
  }
};

exports.delete = async function (userID) {
  try {
    await RefreshToken.destroy({ owner: userID });
  } catch (e) {
    console.log(e.error);
  }
};
