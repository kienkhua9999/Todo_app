/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
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

CODE = function (len) {
  var code = [];
  var bcrypts = "0123456789";
  var bcryptsLen = bcrypts.length;

  for (var i = 0; i < len; ++i) {
    code.push(bcrypts[getRandomInt(0, bcryptsLen - 1)]);
  }

  return code.join("");
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const formatDate = (d) => {
  var month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return (
    [year, month, day].join("-") +
    " " +
    [d.getHours(), d.getMinutes()].join(":")
  );
};
var date = new Date();
var nodemailer = require("nodemailer");
var bcrypt = require("bcryptjs");

module.exports = {
  register: async (req, res) => {
    if (
      req.body.username !== "" &&
      req.body.email !== "" &&
      req.body.password !== "" &&
      req.body.name !== "" &&
      req.body.address !== "" &&
      req.body.phone !== ""
    ) {
      try {
        console.log(formatDate(date));
        await User.create({
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
          name: req.body.name,
          address: req.body.address,
          phone: req.body.phone
         
        });
        return res.json(200, { message: " Registered successfully!" });
      } catch (e) {
        return res.json(500, { message: e.err });
      }
    } else {
      var t = "";
      if (req.body.username === "") {
        t += "username,";
      }
      if (req.body.password === "") {
        t += "password, ";
      }
      if (req.body.password.length < 6) {
        t += "password must more than 6 character, ";
      }
      if (req.body.name === "") {
        t += "name, ";
      }
      if (req.body.email === "") {
        t += "email,";
      }
      if (req.body.address === "") {
        t += "address,";
      }
      if (req.body.phone === "") {
        t += "phone.";
      }
      return res.json({ message: "Missing " + t });
    }
  },

  login: async (req, res) => {
    var d = new Date();
    var data = req.body;
    var user;
    var RFTOKEN;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "phamtrungkienk28cc@gmail.com",
        pass: "kienkhuak28c",
      },
    });

    if (
      data.username !== "" &&
      data.password !== "" &&
      data.device !== "" &&
      data.ip !== ""
    ) {
      try {
        user = await User.findOne({ username: data.username });
        if (!user) {
          return res.json(404, { message: " User no found." });
        }
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );

        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!",
          });
        }

        var { password,createdAt,updatedAt, ...information } = user;

        var FindDevice = await Device.findOne({ owner: user.id });
        if (FindDevice) {
          var code = CODE(6);
          if (
            FindDevice.publicIp !== data.ip ||
            FindDevice.userAgent !== data.device
          ) {
            var vCode = await VerifyCode.findOne({ owner: user.id });
            if (!vCode) {
              await VerifyCode.create({
                owner: user.id,
                code: code,
                timeCreate: d.getTime(),
                timeExpires: 1 * 60 * 1000,
              });

              var mailOptions = {
                from: "phamtrungkienk28cc@gmail.com",
                to: user.email,
                subject: "Sending Email",
                text: `
                Detect the account being logged in somewhere else. Your authentication code is : ${code}. If it's not you, ignore this message.`,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                }
              });
              return res.json({
                message: `Detect login on another device. We have sent a confirmation code to ${user.email}`,
                type: user.email,
              });
            } else {
              if (data.verifyCode) {
                if (data.verifyCode !== vCode.code) {
                  return res.json({ message: "Wrong authentication" });
                } else {
                  var ASTOKEN = TOKEN(50);
                  var RFTOKEN = TOKEN(50);
                  var secret = TOKEN(10);

                  RFTOKEN = await RefreshToken.findOne({ owner: user.id });
                  if (!RFTOKEN) {
                    var ASTOKENNew = TOKEN(50);
                    refreshToken.create(
                      user.id,
                      RFTOKEN,
                      60 * 60 * 1000,
                      secret
                    );
                    accessToken.create(
                      user.id,
                      ASTOKENNew,
                      1 * 60 * 1000,
                      secret,
                      d.getTime()
                    );
                    return res.json(200, {
                      token: ASTOKENNew,
                      user: information,
                    });
                  }

                  if (RFTOKEN.timeCreate + RFTOKEN.time > d.getTime()) {
                    var checkAcToken = await AccessToken.findOne({
                      owner: user.id,
                    });
                    if (!checkAcToken) {
                      accessToken.create(
                        user.id,
                        ASTOKEN,
                        12 * 60 * 1000,
                        secret
                      );
                    }

                    if (
                      checkAcToken.createTime + checkAcToken.time <
                      d.getTime()
                    ) {
                      accessToken.update(user.id, ASTOKEN);
                    }
                    return res.json(200, {
                      token: checkAcToken.token,
                      user: information,
                    });
                  }
                }
                if (vCode.timeCreate + vCode.timeExpires < d.getTime()) {
                  await VerifyCode.destroy({ owner: user.id });
                  return res.json({ message: "Validity Expiration Time" });
                }
              } else {
                if (vCode.timeCreate + vCode.timeExpires < d.getTime()) {
                  await VerifyCode.destroy({ owner: user.id });
                  return res.json({
                    message: "The otp code has expired",
                  });
                }
                return res.json({ message: "Nothentication" });
              }
            }
          }
        } else {
          await Device.create({
            publicIp: data.ip,
            userAgent: data.device,
            owner: user.id,
          });
        }

        var ASTOKEN = TOKEN(50);
        var RFTOKEN1 = TOKEN(50);
        var secret = TOKEN(10);

        RFTOKEN = await RefreshToken.findOne({ owner: user.id });
        if (!RFTOKEN) {
          var ASTOKENNew = TOKEN(50);
          refreshToken.create(user.id, RFTOKEN1, 60 * 60 * 1000, secret);
          accessToken.create(
            user.id,
            ASTOKENNew,
            1 * 60 * 1000,
            secret,
            d.getTime()
          );
          return res.json(200, { token: ASTOKENNew, user: information });
        }

        if (RFTOKEN.timeCreate + RFTOKEN.time > d.getTime()) {
          var checkAcToken = await AccessToken.findOne({ owner: user.id });
          if (!checkAcToken) {
            accessToken.create(user.id, ASTOKEN, 12 * 60 * 1000, secret);
          }

          if (checkAcToken.createTime + checkAcToken.time < d.getTime()) {
            accessToken.update(user.id, ASTOKEN);
          }
          return res.json(200, {
            token: checkAcToken.token,
            user: information,
          });
        }
        refreshToken.delete(user.id);
        accessToken.delete(user.id);

        return res.json(200, { message: "Sign up expired. Sign in again" });
      } catch (e) {
        return res.json({ message: "Lỗi: " + e.error });
      }
    }
  },
 verifyCODE : async (req, res) => {
    var d = new Date();
    var data= req.body;
    var user;
    var RFTOKEN;
      try {
        user = await User.findOne({ id: req.params.id });

        var { password,createdAt,updatedAt, ...information } = user;

  
            var vCode = await VerifyCode.findOne({ owner: user.id });
         
              if (data.verifyCode) {
                if (data.verifyCode !== vCode.code) {
                  return res.json({ message: "Wrong authentication" });
                } else {
                  var ASTOKEN = TOKEN(50);
                  var RFTOKEN = TOKEN(50);
                  var secret = TOKEN(10);

                  RFTOKEN = await RefreshToken.findOne({ owner: user.id });
                  if (!RFTOKEN) {
                    var ASTOKENNew = TOKEN(50);
                    refreshToken.create(
                      user.id,
                      RFTOKEN,
                      60 * 60 * 1000,
                      secret
                    );
                    accessToken.create(
                      user.id,
                      ASTOKENNew,
                      1 * 60 * 1000,
                      secret,
                      d.getTime()
                    );
                    return res.json(200, {
                      token: ASTOKENNew,
                      user: information,
                    });
                  }

                  if (RFTOKEN.timeCreate + RFTOKEN.time > d.getTime()) {
                    var checkAcToken = await AccessToken.findOne({
                      owner: user.id,
                    });
                    if (!checkAcToken) {
                      accessToken.create(
                        user.id,
                        ASTOKEN,
                        12 * 60 * 1000,
                        secret
                      );
                    }

                    if (
                      checkAcToken.createTime + checkAcToken.time <
                      d.getTime()
                    ) {
                      accessToken.update(user.id, ASTOKEN);
                    }
                    return res.json(200, {
                      token: checkAcToken.token,
                      user: information,
                    });
                  }
                }
                if (vCode.timeCreate + vCode.timeExpires < d.getTime()) {
                  await VerifyCode.destroy({ owner: user.id });
                  return res.json({ message: "Validity Expiration Time" });
                }
              } else {
                if (vCode.timeCreate + vCode.timeExpires < d.getTime()) {
                  await VerifyCode.destroy({ owner: user.id });
                  return res.json({
                    message: "The otp code has expired",
                  });
                }
                return res.json({ message: "Nothentication" });
              }
            
      } catch (e) {
        return res.json({ message: "Lỗi: " + e.error });
      }
    
  },
  logout: async (req, res) => {
    var data = req.headers;
    try {
      if (data.token) {
        var acToken = await AccessToken.findOne({ token: data.token });
        if (acToken) {
          await AccessToken.destroy({ owner: acToken.owner });
          var RFTOKEN = await RefreshToken.findOne({ owner: acToken.owner });
          if (RFTOKEN) {
            await RefreshToken.destroy({ owner: acToken.owner });
          }
          var vCode = await VerifyCode.findOne({ owner: acToken.owner });
          if (vCode) {
            await VerifyCode.destroy({ owner: acToken.owner });
          }
          return res.json({ message: "Signout successful" });
        } else {
          return res.json({ message: "Deny the signout request" });
        }
      }
    } catch (err) {
      return res.json(400, { message: err.error });
    }
  },

  list: async (req, res) => {
    try {
      var listUser = await User.find({ id: req.userID });
        return res.json(200, { listUser });
    } catch (e) {
      return res.json(500, { message: e.error });
    }},

  update: async (req, res) => {
    await User.update({ id: req.params.id })
      .set({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        name: req.body.name,
      })
      .then(() => {
        res.send({ message: "update successfully!" });
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  },
  delete: async (req, res) => {
    await User.destroy({ id: req.params.id })
      .then(() => {
        res.send({ message: "delete successfully!" });
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  },
};
