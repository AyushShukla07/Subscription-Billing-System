import Plan from "../models/Plan.js";

//Adding Plan API (Admin only)

export const createPlan = async (req, res) => {
    try {
        const { name, price, interval, stripePriceId } = req.body;

        const plan = await Plan.create({
            name,
            price,
            interval,
            stripePriceId
        });

        res.status(201).json({
            message: "Plan created successfully",
            plan
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

//Getting All Plans API

export const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find().sort({ price: 1 });
        res.status(200).json(plans);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

//Deleting Plan API

export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await Plan.findByIdAndDelete(id);

        if (!plan)
            return res.status(404).json({ message: "Plan not found" });

        res.status(200).json({ message: "Plan deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};