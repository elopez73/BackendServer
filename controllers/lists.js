import poolTD from "../database/poolTD.js";

export const getList = async (req, res) => {
    const { userId } = req.params; // Assuming you have user authentication in place
    try {
        const [listsData] = await poolTD.query(
            'SELECT list_id, list_name FROM lists WHERE user_id = ?',
            userId
        );

        const listData = await Promise.all(
            listsData.map(async (list) => {
                const [itemsResult] = await poolTD.query(
                    'SELECT item_text,item_complete FROM items WHERE list_id = ?',
                    [list.list_id]
                );
                const items = itemsResult.map(item => ({
                    item_text: item.item_text,
                    item_complete: item.item_complete
                }));
                return { ...list, items };
            })
        );
        res.json(listData);
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ error: 'An error occurred while fetching lists' });
    }
};
export const saveList = async (req, res) => {
    const { title, items, user_Id, list_id } = req.body;
    console.log(user_Id);

    try {
        const existingList = await poolTD.query(
            'SELECT list_id FROM lists WHERE list_id = ?',
            [list_id]
        );

        if (existingList[0].length > 0) {

            await poolTD.query(
                'UPDATE lists SET list_name = ? WHERE list_id = ?',
                [title, list_id]
            );
            await poolTD.query('DELETE FROM items WHERE list_id = ?', list_id);
            for (const item of items) {
                await poolTD.query(
                    'INSERT IGNORE INTO items (list_id, item_text, item_complete) VALUES (?, ?, ?)',
                    [list_id, item.item_text, item.item_complete]
                );
            }

            res.status(200).json({ message: 'List updated successfully' });
        } else {
            const result = await poolTD.query(
                'INSERT INTO lists (user_id, list_name) VALUES (?, ?)',
                [user_Id, title]
            );
            const listId = result[0].insertId;
            for (const item of items) {
                await poolTD.query(
                    'INSERT INTO items (list_id, item_text) VALUES (?, ?)',
                    [listId, item]
                );
            }

            res.status(201).json({ message: 'New list created and items added' });
        }
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ error: 'An error occurred while updating the list' });
    }
};

export const removeList = async (req, res) => {
    const { listId } = req.params;
    try {
        await poolTD.query(`DELETE FROM items WHERE list_id = ${listId}`);
        await poolTD.query(`DELETE FROM lists WHERE list_id =  ${listId}`);
        res.status(200).json({ message: 'List deleted successfully' });
    } catch (error) {

        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'An error occurred while deleting the list' });
    }
}
