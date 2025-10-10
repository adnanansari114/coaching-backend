// middleware/roleMiddleware.js

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Admin access only." });
    }
};

exports.teacher = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Teacher access only." });
    }
};

exports.student = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Student access only." });
    }
};

exports.user = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: User access only." });
    }
};
