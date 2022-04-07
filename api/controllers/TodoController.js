/**
 * TodoController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
  // list: async (req, res) => {
  //   try {
  //     var ListTodo = await Todo.find({});
  //     res.json(ListTodo);
  //   } catch (err) {
  //     res.send(err);
  //   }
  // },

  // create: async (req, res) => {
  //   try {
  //     var data =req.body;
  //     var createTodo = await Todo.create({
  //       name: data.name,
  //       dateStart: data.dateStart,
  //       deadline: data.deadline,
  //       status: false,
  //       userID: data.userID
  //     }).fetch();
  //     res.json({
  //       status: 200,
  //       message: "Successfully created new users",
  //       item: createTodo,
  //     });
  //   } catch (err) {
  //     if (err.code === "E_UNIQUE") {
  //       res.json({ status: 409, message: "Username already exist" });
  //     } else if (err.name === "UsageError") {
  //       res.badRequest();
  //     } else {
  //       res.serverError(err);
  //     }
  //   //res.send(err)
  //   }
  // },

  // update: async (req, res) => {
  //   var data =req.body;
  //   await Todo.update({ id: req.params.id })
  //     .set({
  //       name: data.name,
  //       dateStart: data.dateStart,
  //       deadline: data.deadline,
  //       status: data.status,
  //       userID: data.userID,
  //     })
  //     .then(() => {
  //       res.send({ message: "update successfully!" });
  //     })
  //     .catch((err) => {
  //       res.status(500).send({ message: err.message });
  //     });
  // },
  // delete: async (req, res) => {
  //   await Todo.destroy({ id: req.params.id })
  //     .then(() => {
  //       res.send({ message: "delete successfully!" });
  //     })
  //     .catch((err) => {
  //       res.status(500).send({ message: err.message });
  //     });
  // },

  create: async (req, res) => {
    var data = req.body;
    try {
      let Created = await Todo.create({
        name: data.name,
        dateStart: data.dateStart,
        deadline: data.deadline,
        status: false,
        userID: req.userID
      }).fetch();
      if (req.updateToken === true) {
        return res.json(200, { message: 'Add successfully!', todo: Created, token: req.newAcToken });
      } else {
      return res.json(200, { message: 'Add successfully!', todo: Created });
     }
    } catch (e) {
      return res.send(e.error );
    }
  },

  list: async (req, res) => {
    try {
      var listTodo = await Todo.find({ userID: req.userID });
      if (listTodo.length <= 0) {
        return res.json(200, { message: 'no task', token: req.newAcToken });
      }
      if (req.updateToken === true) {
        return res.json(200, { todos: listTodo, token: req.newAcToken });
      } else {
      
      return res.json(200, { todos: listTodo, });
      }
    } catch (e) {
      return res.json(500, { message: e.error });
    }
  },

  update: async (req, res) => {
    var data = req.body;
    try {
      const updateTodod = await Todo.update({ id: req.params.id })
        .set({
          name: data.name,
          dateStart: data.dateStart,
          deadline: data.deadline,
          status: data.status,
        }).fetch();
      if (req.updateToken === true) {
        return res.json(200, { message: 'Update successfully!', todo: updateTodod, token: req.newAcToken });
      } else {
        return res.json(200, { message: 'Update successfully!', todo: updateTodod });
      }
    } catch (e) {
      return res.json(500, { message: e.error });
    }
  },

  delete: async (req, res) => {
   
    try {
      await Todo.destroy({ id: req.params.id });
      if (req.updateToken === true) {
        return res.json(200, { message: 'Delete successfully', token: req.newAcToken });
      } else {
        return res.json(200, { message: 'Delete successfully' });
      }
    } catch (e) {
      return res.json(500, { message: e.error });
    }
  }

};

