import { sql } from '../config/db.js';

class PriceService {
  async createDailyPrice(priceData) {
    const { dropping_point_id, category, price, created_by } = priceData;

    const result = await sql`
      INSERT INTO daily_price (dropping_point_id, category, price, created_by) 
      VALUES (${dropping_point_id}, ${category}, ${price}, ${created_by})
      RETURNING *
    `;

    return result[0];
  }

  async getTodayPricesByDroppingPoint(dropping_point_id) {
    return await sql`
      WITH latest_prices AS (
        SELECT DISTINCT ON (category) dp.*
        FROM daily_price dp
        WHERE dp.dropping_point_id = ${dropping_point_id}
          AND dp.effective_date >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY dp.category, dp.effective_date DESC, dp.created_at DESC
      )
      SELECT 
        lp.*, 
        dpp.location_name, 
        u.name as created_by_name
      FROM latest_prices lp
      LEFT JOIN dropping_point dpp ON lp.dropping_point_id = dpp.id
      LEFT JOIN users u ON lp.created_by = u.user_id
      ORDER BY 
        CASE lp.category
          WHEN 'heavy' THEN 1
          WHEN 'light' THEN 2
          WHEN 'cast' THEN 3
          WHEN 'mixer' THEN 4
        END
    `;
  }

  async getAllTodayPrices() {
    return await sql`
      WITH latest_prices AS (
        SELECT DISTINCT ON (dropping_point_id, category) dp.*
        FROM daily_price dp
        WHERE dp.effective_date >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY dp.dropping_point_id, dp.category, dp.effective_date DESC, dp.created_at DESC
      )
      SELECT lp.*, dpp.location_name, u.name as created_by_name
      FROM latest_prices lp
      LEFT JOIN dropping_point dpp ON lp.dropping_point_id = dpp.id
      LEFT JOIN users u ON lp.created_by = u.user_id
      ORDER BY dpp.location_name, lp.category
    `;
  }
  async getAllPreviousPrices() {
    return await sql`
      SELECT *
      FROM daily_price
      WHERE created_at < NOW()::date   -- excludes today's prices
      ORDER BY created_at DESC;
    `;
  }

  async getPreviousPricesByLocation(location_id) {
    return await sql`
      SELECT *
      FROM daily_price
      WHERE dropping_point_id = ${location_id}
      AND created_at < NOW()::date   -- exclude today's prices
      ORDER BY created_at DESC;
    `;
  }

  // 1. Sort by category
  async getPricesSortedByCategory() {
    return await sql`
      SELECT *
      FROM daily_price
      ORDER BY category ASC, created_at DESC;
    `;
  }

  // 2. Filter by custom date range
  async getPricesByDateRange(start_date, end_date) {
    return await sql`
      SELECT *
      FROM daily_price
      WHERE created_at::date BETWEEN ${start_date} AND ${end_date}
      ORDER BY created_at DESC;
    `;
  }

  // 3. Last 7 days prices
  async getLast7DaysPrices() {
    return await sql`
      SELECT *
      FROM daily_price
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC;
    `;
  }

  // 4. Last 30 days prices
  async getLast30DaysPrices() {
    return await sql`
      SELECT *
      FROM daily_price
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC;
    `;
  }

  // 5. Group by date (daily summary)
  async getPricesGroupedByDate() {
    return await sql`
      SELECT 
        created_at::date AS date,
        json_agg(
          json_build_object(
            'id', id,
            'dropping_point_id', dropping_point_id,
            'category', category,
            'price', price,
            'created_by', created_by
          )
        ) AS prices
      FROM daily_price
      GROUP BY created_at::date
      ORDER BY date DESC;
    `;
  }

  async deletePrice(id) {
    return await sql`
      DELETE FROM daily_price
      WHERE id = ${id};
    `;
  }
}

export default new PriceService();