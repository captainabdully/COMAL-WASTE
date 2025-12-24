import priceService from '../services/priceService.js';

class PriceController {
  async createDailyPrice(req, res) {
    try {
      const { dropping_point_id, category, price, created_by } = req.body;
      
      if (!dropping_point_id || !category || price === undefined || !created_by) {
        return res.status(400).json({ message: "All fields are required" });
      }

      await priceService.createDailyPrice(req.body);
      
      res.status(201).json({ message: "Daily price created successfully" });
    } catch (error) {
      console.error("Error creating daily price:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getTodayPricesByDroppingPoint(req, res) {
    try {
      const { dropping_point_id } = req.params;
      
      if (!dropping_point_id) {
        return res.status(400).json({ message: "dropping_point_id is required" });
      }

      const prices = await priceService.getTodayPricesByDroppingPoint(dropping_point_id);
      
      res.status(200).json({ data: prices });
    } catch (error) {
      console.error("Error fetching today's prices:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllTodayPrices(req, res) {
    try {
      const prices = await priceService.getAllTodayPrices();
      
      res.status(200).json({ data: prices });
    } catch (error) {
      console.error("Error fetching today's prices:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async getAllPreviousPrices(req, res) {
  try {
    const prices = await priceService.getAllPreviousPrices();

    res.status(200).json({
      message: "Previous prices fetched successfully",
      data: prices
    });
  } catch (error) {
    console.error("Error fetching previous prices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async getPreviousPricesByLocation(req, res) {
  try {
    const { location_id } = req.params;

    if (!location_id) {
      return res.status(400).json({ message: "location_id is required" });
    }

    const prices = await priceService.getPreviousPricesByLocation(location_id);

    res.status(200).json({
      message: "Previous prices fetched successfully",
      data: prices
    });

  } catch (error) {
    console.error("Error fetching previous prices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async sortByCategory(req, res) {
    try {
      const data = await priceService.getPricesSortedByCategory();
      res.status(200).json({ data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async filterByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ message: "start_date and end_date are required" });
      }

      const data = await priceService.getPricesByDateRange(start_date, end_date);
      res.status(200).json({ data });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async last7Days(req, res) {
    try {
      const data = await priceService.getLast7DaysPrices();
      res.status(200).json({ data });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async last30Days(req, res) {
    try {
      const data = await priceService.getLast30DaysPrices();
      res.status(200).json({ data });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async groupByDate(req, res) {
    try {
      const data = await priceService.getPricesGroupedByDate();
      res.status(200).json({ data });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


}

export default new PriceController();