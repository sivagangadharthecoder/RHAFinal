import { Link } from 'react-router-dom';
import '../styles/ContactPage.css';
import { useToast } from '../context/ToastContext';

const ContactPage = () => {
    const { addToast } = useToast();

    const onSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        // Required for web3forms
        formData.append("access_key", "43bbf669-6bae-4eb8-b6b0-85c2335e94d1");
        formData.append("subject", "New Support Request from RequestHub");
        formData.append("from_name", "RequestHub Contact Form");

        // Honeypot for bots (hidden in form)
        formData.append("botcheck", "");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            });

            const data = await response.json();
            console.log("API Response:", data);

            if (data.success) {
                addToast(
                    { title: 'Success', body: 'Message sent successfully!' },
                    'success'
                );
                event.target.reset();
            } else {
                addToast(
                    { title: 'Error', body: data.message || 'Failed to send. Try again or contact support.' },
                    'error'
                );
            }
        } catch (error) {
            console.error("Submission error:", error);
            addToast(
                { title: 'Network Error', body: 'Failed to connect. Check internet.' },
                'error'
            );
        }
    };

    return (
        <div className="contact" id='contact'>
            <Link to="/" className="contact-header">
                <h1>RequestHub</h1>
            </Link>
            <div className="contact-title">
                <h1>Contact</h1>
            </div>
            <div className="contact-section">
                <div className="contact-left">
                    <h1>Get In Touch</h1>
                    <p>We'll respond within 24 hours.</p>
                    <div className="contact-details">
                        <div className="contact-detail">
                            <img src='call_icon.svg' alt="call" />
                            <a href="tel:8074943499">8074943499</a>
                        </div>
                        <div className="contact-detail">
                            <img src='location.svg' alt="location" />
                            <a href="https://g.co/kgs/ZtWMsRt" target="_blank" rel="noopener noreferrer">
                                Surampalem, East Godavari Dist, Andhra Pradesh
                            </a>
                        </div>
                    </div>
                </div>
                <form onSubmit={onSubmit} className="contact-right">
                    <label>Your Roll Number</label>
                    <input
                        type="text"
                        placeholder='Ex: 21B81A1234'
                        name='name'
                        required
                        pattern="[A-Z0-9]{10}"
                        title="Format: 21B81A1234 (uppercase letters and numbers)"
                    />
                    <label>Your Mobile Number</label>
                    <input
                        type="tel"
                        placeholder='Ex: 9876543210'
                        name='phone'
                        required
                        pattern="[0-9]{10}"
                        title="10-digit number only"
                    />
                    <label>Describe Your Issue</label>
                    <textarea
                        name="message"
                        rows="8"
                        placeholder='Ex: I need help with...'
                        required
                        minLength="10"
                    ></textarea>
                    {/* Honeypot field (hidden from users) */}
                    <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
                    <button type='submit' className="contact-submit">
                        Submit Now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactPage;