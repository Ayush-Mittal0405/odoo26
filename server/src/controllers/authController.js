    const prisma =
require("../config/db");

const bcrypt =
require("bcrypt");

const jwt =
require("jsonwebtoken");

exports.register =
async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      departmentId
    } = req.body;

    const existing =
      await prisma.employee.findUnique({
        where: { email }
      });

    if (existing) {
      return res.status(400)
      .json({
        message:
        "User already exists"
      });
    }

    const hashed =
      await bcrypt.hash(
        password,
        10
      );

    const employee =
      await prisma.employee.create({

        data: {
          name,
          email,
          password: hashed,
          role: "EMPLOYEE",
          departmentId
        }
      });

    res.json(employee);

  } catch (err) {

    console.log(err);

    res.status(500)
    .json(err);
  }
};
exports.login =
async (req, res) => {

  try {

    const {
      email,
      password: inputPassword
    } = req.body;

    const user =
      await prisma.employee
      .findUnique({
        where: {
          email
        }
      });

    if (!user) {
      return res.status(404)
      .json({
        message:
        "User not found"
      });
    }

    const match =
      await bcrypt.compare(inputPassword, user.password);

    if (!match) {
      return res.status(401)
      .json({
        message:
        "Invalid password"
      });
    }

    const token =
      jwt.sign({
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET
      );

    const {
      password: _password,
      ...safeUser
    } = user;

    res.json({
      token,
      user: safeUser
    });

  } catch (err) {

    res.status(500)
    .json(err);
  }
};