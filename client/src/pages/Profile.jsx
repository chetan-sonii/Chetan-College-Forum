import { Row, Col, Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import ProfileHeader from "../components/Profile/ProfileHeader";

const Profile = () => {
  return (
      <main>
        <Container>
          <Row>
            <Col lg={10} className="profile mx-auto">
              <ProfileHeader />
              {/* The Outlet renders the child routes (TopicsTab, CommentsTab, etc.) */}
              <Outlet />
            </Col>
          </Row>
        </Container>
      </main>
  );
};

export default Profile;