import droppingPointService from '../services/droppingPointService.js';
class DroppingPointController {

  createDroppingPoint = async (req, res) => {
    try {
      const { location_name, address, created_by } = req.body;
      // const created_by = req.user.user_id;

      if (!location_name) {
        return res.status(400).json({ message: "location_name is required" });
      }

      const newPoint = await droppingPointService.createDroppingPoint(
        location_name,
        address,
        created_by
      );

      res.status(201).json({
        message: "Dropping point created successfully",
        data: newPoint
      });

    } catch (error) {
      console.error("Error creating dropping point:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  getAllDroppingPoints = async (req, res) => {
    try {
      const points = await droppingPointService.getAllDroppingPoints();
      res.status(200).json({ message: "Success", data: points });
    } catch (error) {
      console.error("Error fetching dropping points:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  getDroppingPointById = async (req, res) => {
    try {
      const { id } = req.params;
      const point = await droppingPointService.getDroppingPointById(id);

      if (!point) {
        return res.status(404).json({ message: "Dropping point not found" });
      }

      res.status(200).json({ data: point });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  updateDroppingPoint = async (req, res) => {
    try {
      const { id } = req.params;
      const { location_name } = req.body;

      if (!location_name) {
        return res.status(400).json({ message: "location_name is required" });
      }

      const updated = await droppingPointService.updateDroppingPoint(id, location_name);

      if (!updated) {
        return res.status(404).json({ message: "Dropping point not found" });
      }

      res.status(200).json({ data: updated });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  deleteDroppingPoint = async (req, res) => {
    try {
      const { id } = req.params;
      const removed = await droppingPointService.deleteDroppingPoint(id);

      if (!removed) {
        return res.status(404).json({ message: "Dropping point not found" });
      }

      res.status(200).json({ message: "Deleted successfully" });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export default new DroppingPointController();
