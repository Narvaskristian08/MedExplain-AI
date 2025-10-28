import Analytics from "../models/analytics.model.js";

// 📊 Dashboard Overview: misunderstood, simplifications, usage instructions
export const getAnalyticsOverview = async (req, res) => {
  try {
    const totalTerms = await Analytics.countDocuments();
    const misunderstood = await Analytics.countDocuments({ misunderstood: 1 });
    const usageInstr = await Analytics.countDocuments({ usageInstr: 1 });

    const topTerms = await Analytics.find()
      .sort({ misunderstood: -1, usagecount: -1 })
      .limit(5)
      .select("term usagecount simpScore misunderstood");

    res.json({
      totalTerms,
      misunderstood,
      usageInstr,
      topTerms,
    });
  } catch (err) {
    console.error("Error fetching analytics overview:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// 📈 Trend / Regression data
export const getTermTrends = async (req, res) => {
  try {
    const data = await Analytics.find().select("term simpScore usagecount timestamp");
    res.json(data);
  } catch (err) {
    console.error("Error fetching term trends:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
