const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const Message = require("../../models/Message");
const Group = require("../../models/Group");

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        let users = await User.find();

        const messages = await Message.find()
          .or([{ from: user.username }, { to: user.username }])
          .sort({ createdAt: -1 });

        console.log(messages);
        console.log(user.username + "wewewewewewewe");

        users = users.map((otherUser) => {
          const latestMessage = messages.find((m) => {
            return m.from === otherUser.username || m.to === otherUser.username;
          });
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        throw err;
      }
    },
    getGroups: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        const users = await User.findOne({ username: user.username });
        let groups = await Group.find({ users: users._id });

        let alteredgroup = groups.map((group) => {
          group.username = group.groupname;
        });
        console.log(groups);
        //groups.latestMessage = [];

        return groups;
      } catch (err) {
        throw err;
      }
    },

    login: async (_, args) => {
      let { username, password } = args;

      let errors = {};

      try {
        const user = await User.findOne({ username: username });

        // const groups = await Group.findOne({ groupname: "group1" });
        // groups.users.push(user._id);
        // groups.save();

        if (!user) {
          errors.username = "username does not exist";
          throw new UserInputError("User not found", { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          errors.username = "passsword is incorrect";
          throw new AuthenticationError("passsword is incorrect", { errors });
        }

        const token = jwt.sign({ username }, "some secret is required", {
          expiresIn: 60 * 60,
        });
        user.token = token;

        return user;
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    register: async (parent, args) => {
      let errors = {};

      let { username, email, password, confirmPassword } = args;

      const user = new User({
        username: username,
        email: email,
        password: password,
      });

      try {
        // request validations
        if (username.trim() === "")
          errors.username = "Username must not be empty";
        if (email.trim() === "") errors.email = "Email must not be empty";
        if (password.trim() === "")
          errors.password = "Password must not be empty";
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "Confirm password must not be empty";
        if (confirmPassword !== password)
          errors.confirmPassword = "Password does not match";
        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        //password hashing
        user.password = await bcrypt.hash(password, 6);
        const userResponse = await user.save();
        return userResponse;
      } catch (err) {
        // error for unique username and email
        if (err.name === "MongoError" && err.code === 11000) {
          errors[Object.keys(err.keyPattern)[0]] = `${
            Object.keys(err.keyPattern)[0]
          } is already taken`;
        }

        throw new UserInputError("Bad request", { errors });
      }
    },
  },
};
