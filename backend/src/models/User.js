module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "student"
    },
    totpSecretEnc: {
      type: DataTypes.TEXT,   // encrypted TOTP secret
      allowNull: false
    }
  });

  return User;
};
