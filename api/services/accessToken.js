exports.create = async function (userID, token, time, secret, timeCreate) {
  try {
    await AccessToken.create({
      token: token,
      time: time,
      timeCreate: timeCreate,
      clientSecret: secret,
      owner: userID
    });
  } catch (e) {
    console.log(e.error);
  }
};

exports.update = async function (userID, token, timeCreate) {
  try {
    await AccessToken.update({ owner: userID })
      .set({
        token: token,
        timeCreate: timeCreate,
        owner: userID
      });
  } catch (e) {
    console.log(e.error);
  }
};

exports.delete = async function (userID) {
  try {
    await AccessToken.destroy({ owner: userID });
  } catch (e) {
    console.log(e.error);
  }
};
