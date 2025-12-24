import roleService from '../services/roleService.js';

class RoleController {
  async createUserRole(req, res) {
    try {
      const { user_id, role } = req.body;
      
      if (!user_id || !role) {
        return res.status(400).json({ message: "User ID and role are required" });
      }

      await roleService.createUserRole(user_id, role);
      
      res.status(201).json({ message: "User role created successfully" });
    } catch (error) {
      console.error("Error creating user role:", error);
      if (error.message.includes('Invalid role')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllRoles(req, res) {
    try {
      const roles = await roleService.getAllRoles();
      
      res.status(200).json({
        message: "All roles fetched successfully",
        data: roles,
        
      
      });
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { user_id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }

      const updated = await roleService.updateUserRole(user_id, role);
      
      if (!updated) {
        return res.status(404).json({ message: "User not found or role not set" });
      }

      res.status(200).json({
        message: "Role updated successfully",
        data: updated
      });
    } catch (error) {
      console.error("Error updating role:", error);
      if (error.message.includes('Invalid role')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteUserRole(req, res) {
    try {
      const { user_id } = req.params;
      const deleted = await roleService.deleteUserRole(user_id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Role not found for this user" });
      }

      res.status(200).json({
        message: "Role deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new RoleController();