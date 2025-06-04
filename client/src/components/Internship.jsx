import { useState } from "react";
import axios from "axios";
import DarkFormWrapper from "../Others/DarkFormWrapper";
import FormGroup from "../Others/FormGroup";
import FileUpload from "../Others/FileUpload";
import SubmitButton from "../Others/SubmitButton";
import "../styles/Forms.css";
import { useToast } from '../context/ToastContext';


function Internship() {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    college: "",
    branch: "",
    semester: "",
    internshipInstitute: "",
    email: "",
    offerLetter: null,
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, offerLetter: e.target.files[0] }));
  };

  const validateForm = () => {
    const requiredFields = [
      'name', 'rollNumber', 'college', 'branch', 'semester',
      'internshipInstitute', 'email', 'startDate', 'endDate'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        addToast(
          {
            title: 'Error',
            body: `Please Fill In The ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} Field !`
          },
          'error'
        );
        return false;
      }
    }

    if (!formData.offerLetter) {
      addToast(
        {
          title: 'Error',
          body: "'Upload Certificate !"
        },
        'error'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/submit-form`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      addToast(
        { title: 'Success', body: 'Form Submission Success !' },
        'success'
      );
    } catch (error) {
      console.error("Error Submitting Form:", error);
      addToast(
        { title: 'Error', body: 'Form Submission Failed !' },
        'error'
      );
    }
  };

  return (
    <DarkFormWrapper title="Internship Application">
      <FormGroup label="Name">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name - At Most 14 Characters"
          required
        />
      </FormGroup>

      <FormGroup label="Roll Number">
        <input
          type="text"
          name="rollNumber"
          value={formData.rollNumber}
          onChange={handleChange}
          placeholder="Roll.No - Capital Letters & Numbers Only"
          required
        />
      </FormGroup>

      <FormGroup label="College">
        <input
          type="text"
          name="college"
          value={formData.college}
          onChange={handleChange}
          placeholder="Enter your college name"
          required
        />
      </FormGroup>

      <FormGroup label="Branch">
        <input
          type="text"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          placeholder="Enter your branch"
          required
        />
      </FormGroup>

      <FormGroup label="Semester">
        <input
          type="text"
          name="semester"
          value={formData.semester}
          onChange={handleChange}
          placeholder="Enter your semester"
          required
        />
      </FormGroup>

      <FormGroup label="Internship Institute">
        <input
          type="text"
          name="internshipInstitute"
          value={formData.internshipInstitute}
          onChange={handleChange}
          placeholder="Enter internship institute"
          required
        />
      </FormGroup>

      <FormGroup label="Email">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </FormGroup>

      <div className="date-group">
        <FormGroup label="Start Date">
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup label="End Date">
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </FormGroup>
      </div>

      <FileUpload
        id="offerLetter"
        name="offerLetter"
        onChange={handleFileChange}
        accept="application/pdf"
        label="Upload Offer Letter (PDF)"
      />

      <SubmitButton onClick={handleSubmit}>Submit Application</SubmitButton>
    </DarkFormWrapper>
  );
}

export default Internship;