// src/components/Profile/ProfileHeader.jsx
import React, { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button, Image, Nav } from "react-bootstrap";
import { MdEdit } from "react-icons/md";
import {
  RiBallPenFill,
  RiTwitterFill,
  RiGithubFill,
  RiFacebookFill,
} from "react-icons/ri";
import { SiGooglemessages } from "react-icons/si";
import { TiGroup } from "react-icons/ti";
import { FaUserCheck, FaThumbsUp } from "react-icons/fa";
import { BsBookmarkFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../redux/slices/profileSlice";
import FollowButton from "./FollowButton";
import SkeletonProfileHeader from "../Skeletons/SkeletonProfileHeader";

function ProfileHeader() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { userProfile, profileIsLoading } = useSelector((state) => state.profile);

  // derive logged user from localStorage (adjust if you store elsewhere)
  const loggedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.username;
    } catch {
      return null;
    }
  })();

  const isOwner = loggedUser === username;
  const location = useLocation();

  // safer pathPart extraction: remove empty strings so trailing slash won't break things
  const pathPart = location.pathname.split("/").filter(Boolean).pop();
  // normalize active key: if visiting /user/:username (no trailing fragment) treat as topics
  const activeKey = pathPart === username || !pathPart ? "topics" : pathPart;

  // set page title when username changes
  useEffect(() => {
    if (username) {
      document.title = `${username} Profile | Education Forum`;
    }
  }, [username]);

  // fetch user profile when username changes
  useEffect(() => {
    if (username) {
      dispatch(getUserProfile(username));
    }
  }, [dispatch, username]);

  if (profileIsLoading) {
    return <SkeletonProfileHeader />;
  }

  if (!userProfile || Object.keys(userProfile).length === 0) {
    // you can return null or a fallback UI
    return null;
  }

  // small fallbacks for images/urls
  const coverUrl = userProfile?.cover?.url || "";
  const avatarUrl = userProfile?.avatar?.url || "";

  return (
      <div className="profile-header">
        <div
            className="user-profile-meta d-flex align-items-center"
            style={{
              backgroundImage: `linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0.5)
          ), url(${coverUrl})`,
            }}
        >
          <Link to={`/user/${userProfile?.username}`} className="user-avatar d-flex">
            <Image src={avatarUrl} roundedCircle alt={`${userProfile?.username} avatar`} />
          </Link>

          <div className="user-info d-flex flex-column">
            <h4 className="user-name">{`${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim()}</h4>
            <div className="user-bio">{userProfile?.bio || ""}</div>

            <div className="user-meta">
              {userProfile?.userID && <span className="user-id">#{userProfile.userID}</span>}
              {userProfile?.username && <span className="username">@{userProfile.username}</span>}
              {/* optional website display */}
              {userProfile?.website && <span className="user-website">{userProfile.website}</span>}
            </div>

            <div className="user-actions">
              {isOwner && (
                  <Link to={`/user/${userProfile?.username}/edit`}>
                    <Button className="edit d-inline-flex align-items-center">
                      <MdEdit />
                      Edit Profile
                    </Button>
                  </Link>
              )}

              <FollowButton passedUser={userProfile} />
            </div>
          </div>
        </div>

        <div className="profile-header-section">
          <div className="social-links">
            {userProfile?.socialNetwork?.facebook && (
                <a
                    href={userProfile.socialNetwork.facebook}
                    className="facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  <RiFacebookFill />
                </a>
            )}

            {userProfile?.socialNetwork?.twitter && (
                <a
                    href={userProfile.socialNetwork.twitter}
                    className="twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  <RiTwitterFill />
                </a>
            )}

            {userProfile?.socialNetwork?.github && (
                <a
                    href={userProfile.socialNetwork.github}
                    className="github"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  <RiGithubFill />
                </a>
            )}
          </div>

          <Nav as="ul" className="profile-menu" activeKey={activeKey}>
            <Nav.Link
                as={Link}
                to={`/user/${userProfile.username}/topics`}
                eventKey="topics"
                className="d-flex align-items-center"
            >
              <div className="d-flex icon-container">
                <RiBallPenFill />
              </div>
              Topics Created
            </Nav.Link>

            <Nav.Link
                as={Link}
                to={`/user/${userProfile.username}/upvoted`}
                eventKey="upvoted"
                className="d-flex align-items-center"
            >
              <div className="d-flex icon-container">
                <FaThumbsUp />
              </div>
              Upvoted Topics
            </Nav.Link>

            <Nav.Link
                as={Link}
                to={`/user/${userProfile.username}/comments`}
                eventKey="comments"
                className="d-flex align-items-center"
            >
              <div className="d-flex icon-container">
                <SiGooglemessages />
              </div>
              Comments
            </Nav.Link>

            <Nav.Link
                as={Link}
                to={`/user/${userProfile.username}/following`}
                eventKey="following"
                className="d-flex align-items-center"
            >
              <div className="d-flex icon-container">
                <FaUserCheck />
              </div>
              Following
            </Nav.Link>

            <Nav.Link
                as={Link}
                to={`/user/${userProfile.username}/followers`}
                eventKey="followers"
                className="d-flex align-items-center"
            >
              <div className="d-flex icon-container">
                <TiGroup />
              </div>
              Followers
            </Nav.Link>

            {isOwner && (
                <Nav.Link
                    as={Link}
                    to={`/user/${userProfile.username}/saved-topics`}
                    eventKey="saved-topics"
                    className="d-flex align-items-center"
                >
                  <div className="d-flex icon-container">
                    <BsBookmarkFill />
                  </div>
                  Saved
                </Nav.Link>
            )}
          </Nav>
        </div>
      </div>
  );
}

export default React.memo(ProfileHeader);