import { useContext, useState, useEffect } from "react";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Avatar, Card, Typography, Spin, Input, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";
import "../styles/UserProfile.css";

const { Title, Text } = Typography;

const UserProfile = () => {
  const { userData, isLoggedin, loading, setUserData } = useContext(AppContent);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userData?.name || "");
  const navigate = useNavigate();

  useEffect(() => {
    setEditedName(userData?.name || "");
  }, [userData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setUserData({ ...userData, name: editedName });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(userData?.name || "");
  };

  const handleNavigateToChangeUsername = () => {
    navigate('/changeusername');
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  if (!isLoggedin || !userData) {
    return (
      <div className="profile-empty-container">
        <Card className="profile-empty-card">
          <Title level={4}>No User Data Available</Title>
          <Text type="secondary">Please Log In To View Your Profile</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <Card className="profile-card">
          <div className="profile-header">
            <Avatar
              size={64}
              icon={<UserOutlined />}
              src={userData.avatar}
              className="profile-avatar"
            />

            <div className="profile-title-container">
              {isEditing ? (
                <div className="profile-edit-container">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="profile-edit-input"
                  />
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    onClick={handleSave}
                    className="profile-edit-button"
                  />
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    className="profile-edit-button"
                  />
                </div>
              ) : (
                <Title level={3} className="profile-title">
                  {userData.name}
                </Title>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <MailOutlined className="profile-detail-icon" />
              <Text strong className="profile-detail-label">Email:</Text>
              <Text className="profile-detail-value">{userData.email}</Text>
            </div>

            <div className="profile-detail-item">
              <IdcardOutlined className="profile-detail-icon" />
              <Text strong className="profile-detail-label">User ID:</Text>
              <Text className="profile-detail-value2  profile-detail-value">{userData._id}</Text>
            </div>

            <div className="profile-detail-item">
              <IdcardOutlined className="profile-detail-icon" />
              <Text strong className="profile-detail-label">Roll Number:</Text>
              <Text className="profile-detail-value">{userData.rollNumber}</Text>
            </div>
          </div>
        </Card>
      </div>

      <div className="profile-actions">
        <Button
          type="primary"
          onClick={handleNavigateToChangeUsername}
          className="change-username-button"
        >
          Edit Username
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;