// Authorization uses trusted server sessions and current database permissions.
function requireUser(req, res, next) {
    const user = req.session && req.session.user;
    if (!user || !Number.isInteger(user.user_id) || user.user_id <= 0) {
        return res.status(401).json({error: 'Authentication required'});
    }
    next();
}

function requireAdmin(req, res, next) {
    requireUser(req, res, () => {
        req.pool.query('SELECT role FROM Users WHERE user_id = ?', [req.session.user.user_id], (error, rows) => {
            if (error) return res.status(503).json({error: 'Authorization service unavailable'});
            if (!rows || rows.length !== 1 || rows[0].role !== 'Admin') {
                return res.status(403).json({error: 'Administrator access required'});
            }
            req.session.user.role = rows[0].role;
            next();
        });
    });
}

function requireManagedBranch(field) {
    if (!['branch_id', 'name'].includes(field)) throw new Error('Invalid branch selector');
    return (req, res, next) => requireUser(req, res, () => {
        const branch = req.body.branch;
        if (branch === undefined || branch === null || branch === '') {
            return res.status(400).json({error: 'Branch required'});
        }
        // The column is chosen from the fixed allowlist; values remain parameters.
        const sql = `SELECT b.branch_id FROM Branches b
            JOIN BranchManagers bm ON bm.branch_id = b.branch_id
            JOIN Users u ON u.user_id = bm.user_id
            WHERE u.user_id = ? AND u.role = 'Manager' AND b.${field} = ?`;
        req.pool.query(sql, [req.session.user.user_id, branch], (error, rows) => {
            if (error) return res.status(503).json({error: 'Authorization service unavailable'});
            if (!rows || rows.length !== 1) {
                return res.status(403).json({error: 'Branch manager access required'});
            }
            req.authorizedBranchId = rows[0].branch_id;
            next();
        });
    });
}

module.exports = {requireUser, requireAdmin, requireManagedBranch};
