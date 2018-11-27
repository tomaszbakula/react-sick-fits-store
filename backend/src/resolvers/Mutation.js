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

    // Generate JWT token
    ctx = generateJWT(ctx, user.id);

    // Return user to the browser
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    // Check if there is a user with that password.
    const user = await ctx.db.query.user({ where: { email }});
    if (!user)
      throw new Error(`No such user found for email ${email}.`);

    // Check if the password is correct.
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new Error('Invalid password!');

    // Generate JWT token.
    ctx = generateJWT(ctx, user.id);

    // Return the user.
    return user;
  }
};

const generateJWT = (ctx, userId) => {
    // Generate JWT for user
    const token = jwt.sign({ userId }, process.env.APP_SECRET);

    // Set JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });

    return ctx;
}

module.exports = Mutations;
