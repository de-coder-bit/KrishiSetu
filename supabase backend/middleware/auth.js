const { supabase } = require("../config/supabase");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

const admin = async (req, res, next) => {
  try {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", req.user.id)
      .single();

    if (userData?.role === "admin") {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
};

module.exports = { protect, admin };
