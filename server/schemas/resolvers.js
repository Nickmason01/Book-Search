const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    users: async () => {
      return User.find({});
    },
    user: async (parent, { userId }) => {
      return User.findOne({ _id: userId });
    },
    // book: async (parent, { title }) => {
    //   const params = title ? { title } : {};
    //   return Book.find({ params });
    // },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("You must be logged in!");
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { user, token };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
    

      // if (!User) {
      //   throw new AuthenticationError("No profile found");
      // }

      // const correctPass = await user.isCorrectPassword(password);

      // if (!correctPass) {
      //   throw new AuthenticationError("no profile found");
      // }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { userId, book }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: userId },
          {
            $addtoSet: { savedBooks: book },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      throw new AuthenticationError("You must be logged in!");
    },
    removeBook: async (parent, { book }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: book } },
          { new: true }
        );
      }
      throw new AuthenticationError("You must be logged in!")
    },
  },
};

module.exports = resolvers;
