const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check it they are logged in.

    const item = await ctx.db.mutation.createItem({
      data: { ...args }
    }, info);

    return item;
  },

  updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    return ctx.db.mutation.updateItem({
      data: updates,
      where: { id: args.id }
    }, info);
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{ id title }`);
    // TODO: Check if we own it.
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    // Lowercase user's email
    args.email = args.email.toLowerCase();

    // Hash user's password
    const password = await bcrypt.hash(args.password, 12);

    // Create user in the database
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      }
    }, info);

    // Create JWT for user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Set JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });

    // Return user to the browser
    return user;
  }
};

module.exports = Mutations;
