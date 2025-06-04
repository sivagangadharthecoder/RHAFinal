import { useRef, useEffect, useContext } from 'react';
import { FaUserTie, FaIdCard, FaCode, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import '../styles/Home.css';
import Navbar from '../components/Navbar';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { useToast } from '../context/ToastContext';


const Home = () => {
    const { addToast } = useToast();

    const navigate = useNavigate();
    const processNodes = useRef([]);
    const processConnectors = useRef([]);
    const { userData } = useContext(AppContent);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        processNodes.current.forEach(node => observer.observe(node));
        processConnectors.current.forEach(connector => observer.observe(connector));

        return () => {
            processNodes.current.forEach(node => observer.unobserve(node));
            processConnectors.current.forEach(connector => observer.unobserve(connector));
        };
    }, []);

    const addToNodesRef = (el) => {
        if (el && !processNodes.current.includes(el)) {
            processNodes.current.push(el);
        }
    };

    const addToConnectorsRef = (el) => {
        if (el && !processConnectors.current.includes(el)) {
            processConnectors.current.push(el);
        }
    }

    const handleLogin = () => {
        addToast(
            { title: 'Info', body: 'Login / Register First !' },
            'info'
        );
        navigate('/login');
    }

    return (
        <div className="zara-portal">
            <Navbar />

            <section className="zara-hero">
                <div className="hero-content">
                    <h1>{userData?.name ? `Hi, ${userData.name}` : 'RequestHub'}</h1>
                    <p className="hero-subtitle">Academic Services Reimagined</p>
                    <div className="hero-line"></div>
                    <p className="hero-description">
                        Streamlined Processes For Modern Academic Needs.
                        Minimal Design, Maximum Efficiency.
                    </p>
                </div>
            </section>

            <section className="services-section">
                <div className="section-header">
                    <h2>Academic Services</h2>
                    <p>Services We Provide</p>
                </div>

                <div className="services-grid">
                    <ServiceCard
                        icon={<FaUserTie />}
                        title="Internship"
                        description="Permission for internship applications"
                        color="#4A6FA5"
                    />
                    <ServiceCard
                        icon={<FaIdCard />}
                        title="ID Card"
                        description="Request new or replacement IDs"
                        color="#7D8CA3"
                    />
                    <ServiceCard
                        icon={<FaCode />}
                        title="Hackathon"
                        description="Register for hackathon & competitions"
                        color="#5C8D89"
                    />
                    <ServiceCard
                        icon={<FaCalendarAlt />}
                        title="Leave"
                        description="Apply for academic leave"
                        color="#9B6A6C"
                    />
                </div>
            </section>

            <section className="process-section">
                <div className="section-header">
                    <h2>How It Works</h2>
                    <p>Simple Steps To Get What You Need</p>
                </div>

                <div className="process-map">
                    <div className="process-node first" ref={addToNodesRef}>
                        <div className="node-circle">1</div>
                        <div className="node-content">
                            <h4>Authenticate</h4>
                            <p>Register/Login With Your Credentials</p>
                        </div>
                    </div>

                    <div className="process-connector" ref={addToConnectorsRef}>
                        <div className="connector-line"></div>
                        <div className="connector-arrow"></div>
                    </div>

                    <div className="process-node" ref={addToNodesRef}>
                        <div className="node-circle">2</div>
                        <div className="node-content">
                            <h4>Verify Mail</h4>
                            <p>Enter OTP Sent To Your Mail</p>
                        </div>
                    </div>

                    <div className="process-connector" ref={addToConnectorsRef}>
                        <div className="connector-line"></div>
                        <div className="connector-arrow"></div>
                    </div>

                    <div className="process-node" ref={addToNodesRef}>
                        <div className="node-circle">3</div>
                        <div className="node-content">
                            <h4>Select Service</h4>
                            <p>Choose From Our Service Offerings</p>
                        </div>
                    </div>

                    <div className="process-connector" ref={addToConnectorsRef}>
                        <div className="connector-line"></div>
                        <div className="connector-arrow"></div>
                    </div>

                    <div className="process-node" ref={addToNodesRef}>
                        <div className="node-circle">4</div>
                        <div className="node-content">
                            <h4>Complete Form</h4>
                            <p>Fill In The Required Details</p>
                        </div>
                    </div>

                    <div className="process-connector" ref={addToConnectorsRef}>
                        <div className="connector-line"></div>
                        <div className="connector-arrow"></div>
                    </div>

                    <div className="process-node last" ref={addToNodesRef}>
                        <div className="node-circle">5</div>
                        <div className="node-content">
                            <h4>Submit & Track</h4>
                            <p>Send Request & Monitor Progress</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-content">
                    {userData ? (
                        <>
                            <h3>Welcome Back, {userData.name}!</h3>
                            <p>Access Your Dashboard To Manage Your Requests !</p>
                        </>
                    ) : (
                        <>
                            <h3>Ready To Begin?</h3>
                            <p>Access The Portal With Your Credentials</p>
                            <button className="zara-button" onClick={handleLogin}>
                                Login <FaChevronRight className="button-icon" />
                            </button>
                        </>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
};

const ServiceCard = ({ icon, title, description, color }) => {
    return (
        <div className="service-card" style={{ '--hover-color': color }}>
            <div className="card-icon" style={{ color }}>
                {icon}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="card-hover-indicator"></div>
        </div>
    );
};

export default Home;