const User = require("../../models/User");
const Message = require("../../models/Message");
const { UserInputError, AuthenticationError } = require("apollo-server");
const { PubSub } = require("apollo-server");
const Group = require("../../models/Group");

const pubsub = new PubSub();

module.exports = {
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const group = await Group.findOne({ groupname: from });

        if (!group) throw new UserInputError("group not found");

        const messages = await Message.find({
          to: { $in: [user.username, group.groupname] },
        }).sort({ createdAt: -1 });

        return messages;
      } catch (err) {
        throw err;
      }
    },
  },

  Mutation: {
    sendMessage: async (parent, { to, content }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const recipient = await Group.findOne({ groupname: to });

        if (!recipient) throw new UserInputError("group not found");

        if (content.trim() === "")
          throw new UserInputError("message cannot be empty");

        const message = new Message({
          content: content,
          from: user.username,
          to: to,
        });

        const messageResponse = await message.save();
        pubsub.publish("NEW_MESSAGE", { newMessage: messageResponse });

        return messageResponse;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: (_, __, { user }) => {
        if (!user) {
          throw new AuthenticationError("Unauthenticated");
        }
        return pubsub.asyncIterator(["NEW_MESSAGE"]);
      },
    },
  },
};
