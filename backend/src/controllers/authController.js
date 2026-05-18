import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export const register = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required." });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Public signup always creates a normal user.
        // Admin users should be created with: npm run create-admin
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });

        const token = createToken(user);

        return res.status(201).json({
            message: "Registration successful.",
            token,
            user: sanitizeUser(user),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Registration failed." });
    }
};

export const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = createToken(user);

        return res.json({
            message: "Login successful.",
            token,
            user: sanitizeUser(user),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Login failed." });
    }
};

export const me = async(req, res) => {
    res.json({ user: sanitizeUser(req.user) });
};