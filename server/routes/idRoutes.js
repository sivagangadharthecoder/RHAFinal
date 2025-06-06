import IdRequest from "../models/IdRequest.js";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from "dotenv";
import pdf from 'html-pdf';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const router = express.Router();

router.post("/id-card", async (req, res) => {
  try {
    const idRequest = new IdRequest(req.body);
    await idRequest.save();

    const idLetterHtml = `
      <html>
      <head>
        <style>
          .letter-container {
            border: 2px solid #444;
            padding: 10px;
            border-radius: 10px;
            max-width: 700px;
            margin: auto;
          }
          h3 {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p, li {
            font-size: 14px;
            line-height: 1.6;
          }
          ul {
            margin-left: 20px;
          }
          .signature {
            margin-top: 40px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="letter-container">
          <h3>ID Card Application</h3>
          <p><strong>To,</strong><br/>
             The Head of Transport Department,<br/>
             ${idRequest.college}
          </p>
          <p><strong>Date:</strong> ${idRequest.requestDate}</p>
          <p><strong>Subject:</strong> Request for Student ID Card</p>

          <p>Respected Sir/Madam,</p>
          <p>I am ${idRequest.studentName}, a student of ${idRequest.year} Year in the Department of ${idRequest.department}, with Roll Number ${idRequest.rollNumber}. I am writing to request the issuance of a student ID card.</p>
          <p>My details are as follows:</p>

          <ul>
            <li><strong>Name:</strong> ${idRequest.studentName}</li>
            <li><strong>Roll Number:</strong> ${idRequest.rollNumber}</li>
            <li><strong>Year:</strong> ${idRequest.year}</li>
            <li><strong>Department:</strong> ${idRequest.department}</li>
            <li><strong>Address:</strong> ${idRequest.residence}</li>
            <li><strong>College:</strong> ${idRequest.college}</li>
            <li><strong>Phone:</strong> ${idRequest.phone}</li>
            <li><strong>Email:</strong> ${idRequest.email}</li>
            <li><strong>Transport:</strong> ${idRequest.transport}</li>
          </ul>

          <p>I need the ID card for ${req.body.reason || "identification and academic purposes"}.</p>
          <p>I kindly request you to process my application and issue my ID card at your earliest convenience.</p>
          <p>Thank you for your time and consideration.</p>

          <div class="signature">
            <p>Sincerely,<br/>
            ${idRequest.studentName}<br/>
            Contact No: ${idRequest.phone}<br/>
            Email: ${idRequest.email}</p>
          </div>

          <div class="footer">
            <p>This is an automated request generated by the ID Card Request System. For any issues, contact the university admin.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const pdfOptions = { format: 'Letter', orientation: 'portrait', border: '2cm' };
    const outputDir = path.join(__dirname, "..", "Idpdfs");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pdfPath = path.join(outputDir, `${idRequest._id}.pdf`);

    pdf.create(idLetterHtml, pdfOptions).toFile(pdfPath, async (err, result) => {
      if (err) {
        console.error("PDF generation failed:", err);
        return res.status(500).json({ message: "PDF generation failed" });
      }

      const pdfAttachment = {
        filename: `ID_Card_Request_${idRequest._id}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      };

      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: idRequest.email,
        subject: 'ID Card Request Submitted Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">ID Card Request Confirmation</h2>
            <p>Dear ${idRequest.studentName},</p>
            <p>Your ID card request has been submitted successfully. Below are the details of your request:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Name:</strong> ${idRequest.studentName}</p>
              <p><strong>Roll Number:</strong> ${idRequest.rollNumber}</p>
              <p><strong>Department:</strong> ${idRequest.department}</p>
              <p><strong>College:</strong> ${idRequest.college}</p>
              <p><strong>Transport:</strong> ${idRequest.transport}</p>
              <p><strong>Request Date:</strong> ${idRequest.requestDate}</p>
            </div>
            
            <p>Attached is a PDF copy of your request for your records.</p>
            
            <p>If you have any questions, please contact the administration.</p>
            
            <p>Best regards,<br/>
            ${idRequest.college} Administration</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #777;">
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        `,
        attachments: [pdfAttachment]
      };

      const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New ID Card Request - ${idRequest.studentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New ID Card Request Received</h2>
            <p>A new ID card request has been submitted by ${idRequest.studentName}.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Student Name:</strong> ${idRequest.studentName}</p>
              <p><strong>Roll Number:</strong> ${idRequest.rollNumber}</p>
              <p><strong>Department:</strong> ${idRequest.department}</p>
              <p><strong>College:</strong> ${idRequest.college}</p>
              <p><strong>Email:</strong> ${idRequest.email}</p>
              <p><strong>Phone:</strong> ${idRequest.phone}</p>
              <p><strong>Transport:</strong> ${idRequest.transport}</p>
              <p><strong>Request Date:</strong> ${idRequest.requestDate}</p>
              <p><strong>Reason:</strong> ${idRequest.reason || "Not specified"}</p>
            </div>

            <p>Please process this request at your earliest convenience.</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #777;">
              <p>This is an automated notification from the ID Card Request System.</p>
            </div>
          </div>
        `,
        attachments: [pdfAttachment]
      };

      try {
        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(adminMailOptions);

        return res.status(201).json({
          message: "ID Card request submitted successfully",
          pdfPath: `/Idpdfs/${idRequest._id}.pdf`
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(201).json({
          message: "ID Card request submitted but email notification failed",
          pdfPath: `/Idpdfs/${idRequest._id}.pdf`
        });
      }
    });
  } catch (error) {
    console.error("Request failed:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/id-requests", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status
    } = req.query;

    const query = {
      $or: [
        { studentName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ]
    };

    if (status && ['pending', 'approved', 'rejected'].includes(status.toLowerCase())) {
      query.status = status.toLowerCase();
    }

    const requests = await IdRequest.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ requestDate: -1 });

    const count = await IdRequest.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalRecords: count
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/id-requests/pdf/:id", async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, "..", "Idpdfs", `${req.params.id}.pdf`);
    if (fs.existsSync(pdfPath)) {
      return res.sendFile(pdfPath);
    }
    res.status(404).json({ message: "PDF not found" });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/id-requests/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const request = await IdRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const pdfPath = path.join(__dirname, "..", "Idpdfs", `${request._id}.pdf`);

    let emailSubject, emailHtml;
    if (status === 'approved') {
      emailSubject = 'Your ID Card Request Has Been Approved';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">ID Card Request Approved</h2>
          <p>Dear ${request.studentName},</p>
          <p>We're pleased to inform you that your ID card request has been approved.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Request ID:</strong> ${request._id}</p>
            <p><strong>Name:</strong> ${request.studentName}</p>
            <p><strong>Roll Number:</strong> ${request.rollNumber}</p>
            <p><strong>Department:</strong> ${request.department}</p>
          </div>
          
          <p>You can collect your ID card from the administration office during working hours.</p>
          
          <p>Best regards,<br/>
          ${request.college} Administration</p>
        </div>
      `;
    } else if (status === 'rejected') {
      emailSubject = 'Your ID Card Request Has Been Rejected';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">ID Card Request Rejected</h2>
          <p>Dear ${request.studentName},</p>
          <p>We regret to inform you that your ID card request has been rejected.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Request ID:</strong> ${request._id}</p>
            <p><strong>Name:</strong> ${request.studentName}</p>
            <p><strong>Roll Number:</strong> ${request.rollNumber}</p>
            <p><strong>Department:</strong> ${request.department}</p>
          </div>
          
          <p>For more information, please contact the administration office.</p>
          
          <p>Best regards,<br/>
          ${request.college} Administration</p>
        </div>
      `;
    }

    if (emailSubject && emailHtml) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: request.email,
        subject: emailSubject,
        html: emailHtml,
        attachments: [{
          filename: `ID_Request_${request._id}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf'
        }]
      };

      await transporter.sendMail(mailOptions);
    }

    res.json(request);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/id-requests/:id", async (req, res) => {
  try {
    const request = await IdRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const pdfPath = path.join(__dirname, "..", "Idpdfs", `${req.params.id}.pdf`);
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;