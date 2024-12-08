import nodemailer from "nodemailer";
import multer from "multer";
import dotenv from "dotenv";
import pool from "../db/db.js";

// Load environment variables
dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname); // Timestamped filenames
  },
});

const upload = multer({ storage });

// Email form submission handler
const submitForm = async (req, res) => {
  const formData = req.body;
  const imagePaths = req.files?.map(file => file.path) || []; // Handling multiple images

  // Log form data and image paths
  console.log("Form Data:", formData);
  console.log("Image Paths:", imagePaths);

  // Set up nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Correct SMTP host for Gmail
    port: 587,               // Port for TLS (secure connection)
    secure: false,           // Use TLS (encryption)
    auth: {
      user: 'filibiinfanax10@gmail.com', // Your Gmail address
      pass: 'ftde hndr uism bzwd',       // Your Gmail password (Consider using OAuth2 for better security)
    },
  });
  
  const mailOptions = {
    from: 'no-reply@xtocast.com',
    to: formData.email,
    subject: "New Form Submission",
    html: `
      <h3>${formData.formName}</h3>
      <p><strong>First Name:</strong> ${formData.firstName}</p>
      <p><strong>Last Name:</strong> ${formData.lastName}</p>
      <p><strong>Shop/Brand Name:</strong> ${formData.shopName}</p>
      <p><strong>shopCategory:</strong> ${formData.shopCategory}</p>
      <p><strong>Constituency:</strong> ${formData.constituency}</p>
      <p><strong>Gender:</strong> ${formData.gender}</p>
      <p><strong>Previously Competed:</strong> ${formData.hasCompetedBefore}</p>
      ${
        imagePaths.length > 0
          ? `<p><strong>Uploaded Images:</strong></p>
          <table style="width: 100%; border-spacing: 10px;">
            <tr>
              ${imagePaths
                .map(
                  (path, index) => `
              <td style="width: 50%; text-align: center; padding: 10px;">
                <img src="cid:image_id_${index}" alt="Uploaded Image ${index}" style="max-width: 100%; border-radius: 8px;"/>
              </td>`
                )
                .join("")}
            </tr>
          </table>`
          : ""
      }
    `,
    attachments: imagePaths.map((path, index) => ({
      filename: req.files[index].originalname,
      path: path,
      cid: `image_id_${index}`, // Ensure each image has a unique CID
    })),
  };
  
  
  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).send("Form submitted successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
};


   const getForms = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT *  FROM Forms');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


export { submitForm, upload,getForms };
