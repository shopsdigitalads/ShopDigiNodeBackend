import moment from "moment";
import pool from "../../../Database/Database.mjs";

class Display {
  static displayEarning = async (req, res) => {
    try {
      const { display_status, display_id, ad_count } = req.body;

      if (!display_status || !Array.isArray(display_status) || display_status.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Invalid or missing display status data"
        });
      }
      console.log(display_status);
      console.log(ad_count);
      console.log(display_id);

      if (!display_id || !ad_count) {
        return res.status(400).json({
          status: false,
          message: "Display ID and ad count are required"
        });
      }


      const [charges] = await pool.query(
        `SELECT dt.display_charge, dt.client_charge
         FROM Display AS d
         LEFT JOIN DisplayType AS dt ON d.display_type_id = dt.display_type_id
         WHERE d.display_id = ?`,
        [display_id]
      );

      if (!charges || charges.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Display type not found"
        });
      }

      const totalInactiveMinutes = 8 * 60; // Total available time
      console.log(charges[0]);

      const total_amt = ad_count * charges[0].display_charge;
      const client_total_amt = (total_amt * charges[0].client_charge) / 100;
      const per_min_charge = client_total_amt / totalInactiveMinutes;

      const data = {};

      display_status.forEach(status => {
        const date = status.date;
        const start_time = moment(status.start_time, 'HH:mm:ss');
        const end_time = moment(status.end_time, 'HH:mm:ss');
        const active_time = moment.duration(end_time.diff(start_time)).asMinutes();

        if (data[date]) {
          data[date].active_time += active_time;
        } else {
          data[date] = { active_time };
        }
      });

      console.log(data);

      for (const date of Object.keys(data)) {
        const inactive_time = Math.max(0, totalInactiveMinutes - data[date].active_time);
        data[date].inactive_time = inactive_time;

        const [display_earning] = await pool.query(
          `SELECT * FROM DisplayEarning WHERE earning_date = ? AND display_id = ?`,
          [date, display_id]
        );

        let fine = inactive_time * per_min_charge;
        let earning = data[date].active_time * per_min_charge;

        if (display_earning.length > 0) {
          let prevEarning = display_earning[0];
          data[date].active_time += prevEarning.active_time;

          let total_active = Math.min(totalInactiveMinutes, data[date].active_time);
          earning = total_active * per_min_charge;
          fine = (totalInactiveMinutes - total_active) * per_min_charge;

          await pool.query(
            `UPDATE DisplayEarning
   SET total_earning = ?, fine = ?, earning = ?, ad_count = ?, active_time = ?, inactive_time = ?
   WHERE display_id = ? AND earning_date = ?`,
            [earning - fine, fine, earning, ad_count, total_active, totalInactiveMinutes - total_active, display_id, date]
          );

        } else {
          await pool.query(
            `INSERT INTO DisplayEarning (active_time, inactive_time, earning_date, display_id, total_earning, fine, earning, ad_count)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [data[date].active_time, inactive_time, date, display_id, earning - fine, fine, earning, ad_count]
          );

        }
      }

      return res.status(200).json({
        status: true,
        message: "Data uploaded successfully"
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Internal server error"
      });
    }
  };

}

export default Display;