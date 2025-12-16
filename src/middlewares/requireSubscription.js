export const requireActiveSubscription = (req, res, next) => {
    const sub = req.user.subscription;

    if (!sub || sub.status !== "active") {
        return res.status(403).json({
            message: "Active subscription required"
        });
    }
    next();
};