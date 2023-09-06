
import apppool from "../database/apppool.js";
export const postComments = async (req, res) => {

    const { userId, auctionId, comment, fname, lname } = req.query;
    const connection = await apppool.getConnection();
    try {
        await connection.query('INSERT INTO comments (userId, auctionId, commentText,fname,lname) VALUES (?, ?, ?,?,?)', [userId, auctionId, comment, fname, lname]);

        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getComments = async (req, res) => {
    const connection = await apppool.getConnection();
    try {
        const [comments] = await connection.query('SELECT * FROM comments');
        console.log(comments);
        res.send(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addLikes = async (req, res) => {
    const { commentId, likes } = req.query;
    const connection = await apppool.getConnection();
    try {
        await connection.query('UPDATE comments SET likes = ? WHERE commentId = ? ', [likes, commentId]);
        res.status(200).json({ message: 'User registered successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }


}
