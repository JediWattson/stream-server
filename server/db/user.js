const bcrypt = require("bcrypt");
const { DataTypes } = require("sequelize");
const saltRounds = 10;

module.exports = (seq) => {
  const User = seq.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
  });

  const create = async (username, password) => {
    try {
      const passwordHash = await bcrypt.hash(password, saltRounds);
      await User.create({ username, passwordHash });
      return true;
    } catch (err) {
      console.error(err);
    }
  };

  const login = async (username, password) => {
    try {
      const users = await User.findAll({ where: { username } });
      if (users.length === 0) return;

      const user = users[0].dataValues;
      const match = bcrypt.compare(password, user.passwordHash);
      if (!match) return;

      await User.update(
        { lastLogin: seq.fn("NOW") },
        { where: { id: user.id } },
      );
      return user;
    } catch (err) {
      console.error(err);
    }
  };

  return { create, login };
};
