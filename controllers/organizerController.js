import pool from '../db/db.js';  // Import the MySQL connection pool

// Get all organizers and their associated forms
export const getOrganizerWithFormByUuid = async (req, res) => {
    const { uuid } = req.params;
  
    try {
      // SQL query to join organizers with their forms based on organizer_id and filter by uuid
      const query = `
        SELECT 
          organizers.id AS organizer_id,
          organizers.username,
          organizers.password,
          organizers.name AS organizer_name,
          organizers.phone_number,
          organizers.email,
          organizers.image,
          organizers.status AS organizer_status,
          organizers.uuid,
          Forms.id AS form_id,
          Forms.name AS form_name,
          Forms.voucher_price,
          Forms.uuid AS form_uuid,
          Forms.organizer_id,
          Users.id AS user_id,
          Users.username AS user_name,
          Users.email AS user_email,
          Users.serial_number AS user_serial_number,
          Users.phone_number AS user_phone_number
        FROM organizers
        LEFT JOIN Forms ON organizers.id = Forms.organizer_id
        LEFT JOIN Users ON Forms.uuid = Users.form_uuid
        WHERE organizers.uuid = ?  -- Filter by the organizer's uuid
      `;
  
      const [rows] = await pool.execute(query, [uuid]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Organizer not found or no forms associated' });
      }
  
      return res.status(200).json(rows[0]);  // Send the first result (single organizer with forms)
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Database error', error: error.message });
    }
  };
  

// Update the status of an organizer by UUID
export const updateStatusByUuid = async (req, res) => {
  const { uuid } = req.params;
  const { status } = req.body;

  try {
    const [result] = await pool.execute('UPDATE organizers SET status = ? WHERE uuid = ?', [status, uuid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
};
