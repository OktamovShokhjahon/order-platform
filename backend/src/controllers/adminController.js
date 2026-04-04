const Order = require('../models/Order');
const User = require('../models/User');
const Food = require('../models/Food');
const Category = require('../models/Category');

const LOCALE_FIELDS = ['en', 'ru', 'uz'];

function normalizeLocale(locale) {
  const l = String(locale || 'en').toLowerCase();
  return LOCALE_FIELDS.includes(l) ? l : 'en';
}

/** @returns {{ start: Date, end: Date, bucket: 'day' | 'week' | 'month' }} */
function resolveDateRange(period, fromStr, toStr) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = new Date(now);
  let bucket = /** @type {'day' | 'week' | 'month'} */ ('day');

  switch (period) {
    case 'weekly':
      start.setDate(start.getDate() - 7 * 8);
      start.setHours(0, 0, 0, 0);
      bucket = 'week';
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      start.setHours(0, 0, 0, 0);
      bucket = 'month';
      break;
    case 'range': {
      if (!fromStr || !toStr) {
        const err = new Error('range_requires_dates');
        err.code = 'BAD_RANGE';
        throw err;
      }
      const rawA = new Date(fromStr);
      const rawB = new Date(toStr);
      if (Number.isNaN(rawA.getTime()) || Number.isNaN(rawB.getTime())) {
        const err = new Error('invalid_dates');
        err.code = 'BAD_RANGE';
        throw err;
      }
      start = new Date(Math.min(rawA.getTime(), rawB.getTime()));
      const endRange = new Date(Math.max(rawA.getTime(), rawB.getTime()));
      start.setHours(0, 0, 0, 0);
      endRange.setHours(23, 59, 59, 999);
      end.setTime(endRange.getTime());
      const daysDiff = (end.getTime() - start.getTime()) / (86400 * 1000);
      if (daysDiff <= 31) bucket = 'day';
      else if (daysDiff <= 180) bucket = 'week';
      else bucket = 'month';
      break;
    }
    case 'daily':
    default:
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      bucket = 'day';
      break;
  }

  return { start, end, bucket };
}

function buildTimeSeriesPipeline(bucket, matchOrder) {
  const base = [{ $match: matchOrder }];
  if (bucket === 'day') {
    base.push(
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }
    );
  } else if (bucket === 'week') {
    base.push(
      {
        $group: {
          _id: {
            y: { $isoWeekYear: '$createdAt' },
            w: { $isoWeek: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.w': 1 } }
    );
  } else {
    base.push(
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }
    );
  }
  return base;
}

function mapTimeSeriesRow(bucket, row) {
  if (bucket === 'day') {
    return { label: row._id, revenue: row.revenue, orders: row.orders };
  }
  if (bucket === 'week') {
    const y = row._id.y;
    const w = row._id.w;
    const label = `${y}-W${String(w).padStart(2, '0')}`;
    return { label, revenue: row.revenue, orders: row.orders };
  }
  return { label: row._id, revenue: row.revenue, orders: row.orders };
}

/** Localized food title for aggregation (avoids $getField for older MongoDB). */
function foodLocalizedNameExpr(locale) {
  const en = '$food.name.en';
  const uz = '$food.name.uz';
  const ru = '$food.name.ru';
  if (locale === 'uz') {
    return { $ifNull: [uz, { $ifNull: [en, 'Unknown'] }] };
  }
  if (locale === 'ru') {
    return { $ifNull: [ru, { $ifNull: [en, 'Unknown'] }] };
  }
  return { $ifNull: [en, 'Unknown'] };
}

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, totalRevenue, todayOrders, totalUsers, totalFoods, totalCategories] =
      await Promise.all([
        Order.countDocuments(),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),
        Order.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments(),
        Food.countDocuments(),
        Category.countDocuments(),
      ]);

    // Daily stats for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayOrders,
      totalUsers,
      totalFoods,
      totalCategories,
      dailyStats,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const period = String(req.query.period || 'daily').toLowerCase();
    const allowed = ['daily', 'weekly', 'monthly', 'range'];
    if (!allowed.includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Use daily, weekly, monthly, or range.' });
    }

    const { start, end, bucket } = resolveDateRange(period, req.query.from, req.query.to);
    const locale = normalizeLocale(req.query.locale);

    // Count all real orders except cancelled (pending payment / COD until delivery still count)
    const matchOrder = {
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    };

    const [
      summaryRow,
      itemsRow,
      timeRaw,
      foodRaw,
      totalUsers,
      totalFoods,
      totalCategories,
      recentOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: matchOrder },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' },
          },
        },
      ]),
      Order.aggregate([
        { $match: matchOrder },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            totalItemsSold: { $sum: '$items.quantity' },
          },
        },
      ]),
      Order.aggregate(buildTimeSeriesPipeline(bucket, matchOrder)),
      Order.aggregate([
        { $match: matchOrder },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.foodId',
            quantitySold: { $sum: '$items.quantity' },
            revenue: {
              $sum: { $multiply: ['$items.quantity', '$items.price'] },
            },
          },
        },
        {
          $lookup: {
            from: 'foods',
            localField: '_id',
            foreignField: '_id',
            as: 'food',
          },
        },
        { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            foodId: '$_id',
            quantitySold: 1,
            revenue: 1,
            name: {
              $cond: {
                if: { $ne: ['$food', null] },
                then: foodLocalizedNameExpr(locale),
                else: 'Unknown',
              },
            },
          },
        },
        { $sort: { quantitySold: -1 } },
      ]),
      User.countDocuments(),
      Food.countDocuments(),
      Category.countDocuments(),
      Order.find(matchOrder)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const summary = {
      totalOrders: summaryRow[0]?.totalOrders || 0,
      totalRevenue: summaryRow[0]?.totalRevenue || 0,
      totalItemsSold: itemsRow[0]?.totalItemsSold || 0,
      totalUsers,
      totalFoods,
      totalCategories,
    };

    const chartSeries = timeRaw.map((row) => mapTimeSeriesRow(bucket, row));

    const foodSales = foodRaw.map((f) => ({
      foodId: f.foodId,
      name: f.name || 'Unknown',
      quantitySold: f.quantitySold,
      revenue: f.revenue,
    }));

    const soldPositive = foodSales.filter((f) => f.quantitySold > 0);
    const topFood = soldPositive.length ? soldPositive[0] : null;
    const lowestFood = soldPositive.length
      ? soldPositive.reduce((a, b) => (a.quantitySold <= b.quantitySold ? a : b))
      : null;

    res.json({
      period,
      bucket,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      summary,
      chartSeries,
      foodSales,
      topFood,
      lowestFood,
      recentOrders,
    });
  } catch (error) {
    if (error.code === 'BAD_RANGE') {
      return res.status(400).json({
        error: 'For period=range, valid from and to dates (YYYY-MM-DD) are required.',
      });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'driver', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const orders = await Order.find({ userId: user._id })
      .populate('items.foodId', 'name image price')
      .sort({ createdAt: -1 });

    res.json({ user, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
