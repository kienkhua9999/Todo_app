/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    username: {
      type: 'string',
      required: true,
      allowNull: false,
      unique: true,
      maxLength: 200
    },

    password: {
      type: 'string',
      required: true,
      allowNull: false,
      minLength: 6,
    },

    name: {
      type: 'string',
      required: true,
      maxLength: 200
    },

    email: {
      type: 'string',
      unique: true,
      allowNull: false
    },

    todos: {
      collection: 'todo',
      via: 'userID'
    },

    accesstoken: {
      collection: 'AccessToken',
      via: 'owner'
    },

    refreshtoken: {
      collection: 'RefreshToken',
      via: 'owner'
    },

    device: {
      collection: 'Device',
      via: 'owner'
    },
    verifyCode:{
      collection: 'VerifyCode',
      via: 'owner'
    },
    address: {
      type: 'string',
      required: true
    },
    phone: {
      type: 'string',
      required: true
    }
  },

};

