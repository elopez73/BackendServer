import poolTD from '../database/poolTD.js';
import bcrypt from 'bcryptjs'




export const register = async (req, res) => {

    const { email, hashpassword } = req.body;
    const connection = await poolTD.getConnection();
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(hashpassword, salt);

    try {
        const [userExists] = await connection.query('SELECT email FROM users WHERE email = ?', [email]);

        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User Exists' });
        }

        const values = [email, hashedPassword];
        await connection.query('INSERT INTO users(`email`,`hashpassword`) VALUES(?)', [values]);
        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
export const login = async (req, res) => {
    const email = req.body.email;
    const hashpassword = req.body.password;
    const connection = await poolTD.getConnection();

    try {
        const [user] = await connection.query('SELECT * FROM users WHERE email = ? ', [email]);
        if (user.length > 0) {
            bcrypt.compare(hashpassword, user[0].hashpassword, (error, response) => {
                if (response) {
                    req.session.user = user;
                    res.send({ loggedIn: true, user: user })
                } else {
                    res.send({ loggedIn: false, message: "Wrong email/password combination" })
                }
            })
        } else {
            res.send({ loggedIn: false, message: "Email dose not exist." })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        } else {
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.send({ message: "Logged out successfully" });
        }
    });
}
