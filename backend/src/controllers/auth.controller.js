const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    getUserByEmail,
    getUserByUsername,
    createUser,
    initializeUserLessonProgress
} = require('../queries/auth.queries');
const { BCRYPT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const { getUserById } = require('../queries/users.queries');


const register = async (req , res , next) => {
    const { email, username, password } = req.body;
    
    if (!email || !username || !password){
        return res.status(400).json({ error: 'email, username, password required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ ;
    if(!passwordRegex.test(password)){
        return res.status(400).json({ error: 'Password must be at least 8 chars long and include uppercase, lowercase, number and special char' });
    }

    try {

        if(await getUserByEmail(email)){
            return res.status(409).json({ error: 'email already in use' });
        }

        if(await getUserByUsername(username)){
            return res.status(409).json({ error: 'username already in use' });
        }

        const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = await createUser({email, username, password_hash});
        await initializeUserLessonProgress(user.id);
        
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                xp: user.xp,
                level: user.level,
                streak_count: user.streak_count
            }
        });

    } catch (error) {
       next(error);
    }
}

const login = async (req , res , next) => {
    const { email, password } = req.body;

    if (!email || !password){
        return res.status(400).json({ error: 'email and password required' });
    }

    try {

        const user = await getUserByEmail(email);
        if(!user){
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                xp: user.xp,
                level: user.level,
                streak_count: user.streak_count
            }
        });

    } catch (error) {
       next(error);
    }
}

const getMe = async (req, res, next) => {
    try {
        const user = await getUserById(req.user.id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }
        res.json({ user });
    } catch (error) {
        next(error);
    }
};



module.exports = { 
    register,
    login ,
    getMe
};
