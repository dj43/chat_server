const { gql } = require("apollo-server");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = gql`
  type User {
    username: String!
    email: String!
    token: String
    latestMessage: Message
  }

  type Message {
    content: String!
    from: String!
    to: String!
    createdAt: String
  }

  type Group {
    username: String!
    latestMessage: Message
  }

  type Query {
    getUsers: [User]!
    login(username: String!, password: String!): User!
    getMessages(from: String!): [Message]
    getGroups: [Group]!
  }
  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!

    sendMessage(to: String!, content: String!): Message!
  }
  type Subscription {
    newMessage: Message!
  }
`;
