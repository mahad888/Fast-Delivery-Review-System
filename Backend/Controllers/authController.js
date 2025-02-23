import User from "../Models/userSchema.js"
import generateToken from "../utils/generatToken.js";
import bcrypt from "bcryptjs";


export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)  

  const user = await User.findOne({ email })
  console.log(user)
  if(!user){

    res.status(401).json({ message: "User not found" });
  }
  const isMatch = await bcrypt.compare(password ,user?.password)
  if (isMatch) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, 
      token: generateToken(user._id),
      message:"Welcome to the Fast Delivery Review System"
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};
