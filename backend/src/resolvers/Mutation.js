const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId)
      throw new Error('You must be logged in to do that!');

    const item = await ctx.db.mutation.createItem({
      data: {
        // This is relationship between the item and the user.
        user: {
          connect: {
            id: ctx.request.userId
          }
        },
        ...args
      }
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
    // Find the item.
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);

    // Check if the user owns it.
    const ownItem = ctx.request.userId === item.user.id;
    const hasPermissions = ctx.request.user.permissions.some(perm => ['ADMIN', 'ITEMDELETE'].includes(perm));

    if (!ownItem && !hasPermissions)  {
      throw new Error("You don't have permissions to do that!");
    }

    // Delete the item.
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
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },

  async requestReset(parent, args, ctx, info) {
    // Check if this is a real user.
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user)
      throw new Error(`No such user found for email ${args.email}.`);

    // Set the reset token and expiry on that user.
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    // Email them that reset token.
    const mailRes = await transport.sendMail({
      from: 'tmk.ninja',
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(`Your Password Reset Token is here! \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset!</a>`)
    });
    console.log(mailRes)

    // Return the message
    return { message: 'Thanks! ' };
  },

  async resetPassword(parent, { password, confirmPassword, resetToken }, ctx, info) {
    // Check if the passwords match.
    if (password !== confirmPassword)
      throw new Error("Your passwords don't match");

    // Check if it is a legit reset token.
    const [ user ] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });

    if (!user)
      throw new Error('This token is either invalid or expired!');

    // Has user's new password.
    const newPassword = await bcrypt.hash(password, 12);

    // Save the new password to the user and remove old resetToken fields.
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // Generate JWT.
    ctx = generateJWT(ctx, user.id);

    // Return the new user.
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    // Check if the user is logged in.
    if (!ctx.request.userId)
      throw new Error('You must be logged in!');

    // Check if the user has permissions to do this.
    const user = ctx.request.user;
    hasPermission(user, ['ADMIN', 'PERMISSIONUPDATE']);

    // Update permissions.
    return ctx.db.mutation.updateUser({
      data: {
        permissions: { set: args.permissions }
      },
      where: { id: args.userId }
    }, info);
  },

  async addToCart(parent, args, ctx, info) {
    // Check if the user is logged in.
    const { userId } = ctx.request;
    if (!userId)
      throw new Error('You must be logged in!');

    // Query user's cart.
    const [ existingCartItem ] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      }
    });

    // Check if that item is already in their cart and increment by 1 if it is.
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      }, info);
    }

    // If it's not, create a fresh CartItem for that user.
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        }
      }
    }, info);
  },

  async removeFromCart(parent, { id }, { db, request }, info) {
    // Find the cart item.
    const cartItem = await db.query.cartItem({ where: { id } }, `{ id, user { id } }`);
    if (!cartItem)
      throw new Error('Not cart item found!');

    // Make sure they own that cart item.
    if (cartItem.user.id !== request.userId)
      throw new Error("You don't have permissions to remove this item.");

    // Delete that cart item.
    return db.mutation.deleteCartItem({ where: { id }}, info);
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
