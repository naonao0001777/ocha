'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Button, Dropdown, Modal, Collapse, Card, Form, FloatingLabel, Alert } from 'react-bootstrap';
import { Upload, Trash2 } from 'lucide-react';

const OchaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
  </svg>
);

interface SocialAccount {
  youtube?: string;
  x?: string;
  twitch?: string;
  github?: string;
  instagram?: string;
  facebook?: string;
}

interface Link {
  id: number;
  title: string;
  url: string;
}

interface UserProfile {
  userId: string;
  userName: string;
  biography: string;
  profileImage?: string;
  socialAccounts: SocialAccount;
  links: Link[];
}

interface AdminPageProps {
  userProfile: UserProfile;
  message?: string;
  onProfileImageUpload?: (file: File) => void;
  onProfileImageDelete?: () => void;
  onSocialAccountUpdate?: (accounts: SocialAccount) => void;
  onLinkAdd?: (title: string, url: string) => void;
  onLinkUpdate?: (linkId: number, title: string, url: string) => void;
  onLinkDelete?: (linkId: number) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({
  userProfile,
  message,
  onProfileImageUpload,
  onProfileImageDelete,
  onSocialAccountUpdate,
  onLinkAdd,
  onLinkUpdate,
  onLinkDelete
}) => {
  const [showSNSCollapse, setShowSNSCollapse] = useState(false);
  const [showLinkCollapse, setShowLinkCollapse] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState(userProfile.socialAccounts);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [editingLinks, setEditingLinks] = useState<{[key: number]: {title: string, url: string}}>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onProfileImageUpload) {
      onProfileImageUpload(file);
    }
  };

  const handleSocialAccountChange = (platform: keyof SocialAccount, value: string) => {
    setSocialAccounts(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSocialAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSocialAccountUpdate) {
      onSocialAccountUpdate(socialAccounts);
    }
  };

  const handleNewLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLink.title && newLink.url && onLinkAdd) {
      onLinkAdd(newLink.title, newLink.url);
      setNewLink({ title: '', url: '' });
    }
  };

  const handleLinkEdit = (linkId: number, title: string, url: string) => {
    setEditingLinks(prev => ({
      ...prev,
      [linkId]: { title, url }
    }));
  };

  const handleLinkUpdate = (linkId: number) => {
    const editData = editingLinks[linkId];
    if (editData && onLinkUpdate) {
      onLinkUpdate(linkId, editData.title, editData.url);
      setEditingLinks(prev => {
        const newEditing = { ...prev };
        delete newEditing[linkId];
        return newEditing;
      });
    }
  };

  const renderSocialIcon = (platform: string, url?: string) => {
    if (!url) return null;
    
    return (
      <a 
        className="d-inline-flex focus-ring p-0 m-2 rounded-circle"
        href={url}
        target="_blank" 
        rel="noopener noreferrer"
      >
        <img 
          width="35px" 
          height="35px" 
          src={`/assets/${platform}_icon.png`} 
          alt={platform} 
        />
      </a>
    );
  };

  return (
    <Container className="text-center">
      {message && (
        <Alert variant="info" dismissible>
          {message}
        </Alert>
      )}

      {/* Profile Image Section */}
      <Row className="justify-content-center m-2 p-2">
        <Col lg={4} xs={3}></Col>
        <Col lg={4} xs={6}>
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="btn rounded-circle border-0 position-relative p-0"
              style={{ background: 'none', border: 'none' }}
            >
              <div 
                className="bg-dark position-absolute bottom-0 start-0 rounded text-center border border-1 d-flex align-items-center justify-content-center"
                style={{ width: '60px', height: '30px', fontSize: '12px' }}
              >
                <Upload size={13} className="me-1" />
                <strong>Edit</strong>
              </div>
              {userProfile.profileImage ? (
                <img 
                  src={userProfile.profileImage} 
                  className="rounded-circle" 
                  width="100px" 
                  height="100px" 
                  alt="Profile" 
                />
              ) : (
                <img 
                  src="/assets/default_leaf.png" 
                  className="rounded-circle" 
                  width="100px" 
                  height="100px" 
                  alt="Default Profile" 
                />
              )}
            </Dropdown.Toggle>
            
            <Dropdown.Menu align="start" className="text-start">
              <Dropdown.Item as="label" htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                Upload a Photo
                <input
                  id="file-upload"
                  type="file"
                  accept="image/png,image/jpeg"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </Dropdown.Item>
              <Dropdown.Item onClick={onProfileImageDelete}>
                Remove Photo
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col lg={4} xs={3}></Col>
      </Row>

      {/* User Name and Profile URL */}
      <Row className="justify-content-center mt-2 p-1">
        <Col lg="auto" xs="auto"></Col>
        <Col lg="auto" xs="auto">
          <h3 className="text-center">{userProfile.userName}</h3>
        </Col>
        <Col lg="auto" xs="auto" className="text-start">
          <Button
            variant="link"
            size="sm"
            className="rounded-circle p-1"
            onClick={() => window.open(`/u/${userProfile.userId}`, '_blank')}
            title="プロフィールURLに行く"
          >
            <img width="23px" height="23px" src="/assets/url_link.png" alt="urllink" />
          </Button>
        </Col>
      </Row>

      {/* Biography */}
      <Row className="justify-content-center mt-1 p-1">
        <Col lg="auto" xs="auto">
          <p className="fw-bold text-center">{userProfile.biography}</p>
        </Col>
      </Row>

      {/* Social Media Icons */}
      <Row className="justify-content-center mt-1 p-1">
        <Col lg="auto" xs="auto">
          {renderSocialIcon('youtube', socialAccounts.youtube)}
          {renderSocialIcon('icon_x', socialAccounts.x)}
          {renderSocialIcon('twitch', socialAccounts.twitch)}
          {renderSocialIcon('github', socialAccounts.github)}
          {renderSocialIcon('instagram', socialAccounts.instagram)}
          {renderSocialIcon('facebook', socialAccounts.facebook)}
        </Col>
      </Row>

      {/* SNS Account Addition */}
      <Row className="justify-content-center m-2 p-1">
        <Col lg={3} xs={3}></Col>
        <Col lg={6} xs={6} className="gap-2">
          <Button
            variant="success"
            className="rounded-pill mb-2"
            onClick={() => setShowSNSCollapse(!showSNSCollapse)}
          >
            SNSアカウントを追加
          </Button>
          
          <Collapse in={showSNSCollapse}>
            <Card className="card-body">
              <Form onSubmit={handleSocialAccountSubmit}>
                <div className="mb-3">
                  <div className="text-start mb-2">
                    <img width="35px" height="35px" src="/assets/youtube_icon.png" alt="YouTube" className="me-2" />
                    YouTube
                  </div>
                  <Form.Control
                    type="url"
                    placeholder="https:// または http://で始まるURLを入れる"
                    value={socialAccounts.youtube || ''}
                    onChange={(e) => handleSocialAccountChange('youtube', e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <div className="text-start mb-2">
                    <img width="35px" height="35px" src="/assets/twitch_icon.png" alt="Twitch" className="me-2" />
                    Twitch
                  </div>
                  <Form.Control
                    type="url"
                    placeholder="https:// または http://で始まるURLを入れる"
                    value={socialAccounts.twitch || ''}
                    onChange={(e) => handleSocialAccountChange('twitch', e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <div className="text-start mb-2">
                    <img width="35px" height="35px" src="/assets/icon_x.png" alt="X" className="me-2" />
                    X
                  </div>
                  <Form.Control
                    type="url"
                    placeholder="https:// または http://で始まるURLを入れる"
                    value={socialAccounts.x || ''}
                    onChange={(e) => handleSocialAccountChange('x', e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <div className="text-start mb-2">
                    <img width="35px" height="35px" src="/assets/github_icon.png" alt="GitHub" className="me-2" />
                    GitHub
                  </div>
                  <Form.Control
                    type="url"
                    placeholder="https:// または http://で始まるURLを入れる"
                    value={socialAccounts.github || ''}
                    onChange={(e) => handleSocialAccountChange('github', e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <div className="text-start mb-2">
                    <img width="35px" height="35px" src="/assets/instagram_icon.png" alt="Instagram" className="me-2" />
                    Instagram
                  </div>
                  <Form.Control
                    type="url"
                    placeholder="https:// または http://で始まるURLを入れる"
                    value={socialAccounts.instagram || ''}
                    onChange={(e) => handleSocialAccountChange('instagram', e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <div className="text-start mb-2">
                    <img width="35px" height="35px" src="/assets/facebook_icon.png" alt="Facebook" className="me-2" />
                    Facebook
                  </div>
                  <Form.Control
                    type="url"
                    placeholder="https:// または http://で始まるURLを入れる"
                    value={socialAccounts.facebook || ''}
                    onChange={(e) => handleSocialAccountChange('facebook', e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="success"
                  className="rounded-circle p-0"
                  style={{ width: '2rem', height: '2rem' }}
                >
                  ＋
                </Button>
              </Form>
            </Card>
          </Collapse>
        </Col>
        <Col lg={3} xs={3}></Col>
      </Row>

      {/* Link Addition */}
      <Row className="justify-content-center m-2 p-1">
        <Col lg={3} xs={3}></Col>
        <Col lg={6} xs={6} className="gap-2">
          <Button
            variant="success"
            className="rounded-pill mb-2"
            onClick={() => setShowLinkCollapse(!showLinkCollapse)}
          >
            リンクを追加
          </Button>
          
          <Collapse in={showLinkCollapse}>
            <Card className="card-body">
              <Form onSubmit={handleNewLinkSubmit}>
                <div className="mb-3">
                  <div className="text-start mb-2">タイトル</div>
                  <Form.Control
                    type="text"
                    placeholder="リンク名を入れる"
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <div className="text-start mb-2">URL</div>
                  <Form.Control
                    type="url"
                    placeholder="https:// または http://で始まるURLを入れる"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  variant="success"
                  className="rounded-circle p-0"
                  style={{ width: '2rem', height: '2rem' }}
                >
                  ＋
                </Button>
              </Form>
            </Card>
          </Collapse>
        </Col>
        <Col lg={3} xs={3}></Col>
      </Row>

      {/* Existing Links */}
      <Row className="justify-content-center">
        {userProfile.links.map((link) => (
          <Row key={link.id} className="justify-content-center mb-3">
            <Col lg={3} xs={2}></Col>
            <Col lg={6} xs={8} className="d-grid gap-2">
              <Button
                variant="outline-success"
                className="text-success-emphasis btn-lg rounded-pill"
                style={{ 
                  '--bs-btn-padding-y': '.70rem',
                  '--bs-btn-padding-x': '.5rem'
                } as React.CSSProperties}
                onClick={() => handleLinkEdit(link.id, link.title, link.url)}
              >
                {link.title}
              </Button>
              
              <Collapse in={!!editingLinks[link.id]}>
                <Card className="card-body">
                  <Form>
                    <div className="mb-3">
                      <div className="text-start mb-2">タイトル</div>
                      <Form.Control
                        type="text"
                        placeholder="リンク名を入れる"
                        value={editingLinks[link.id]?.title || ''}
                        onChange={(e) => setEditingLinks(prev => ({
                          ...prev,
                          [link.id]: { ...prev[link.id], title: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-start mb-2">URL</div>
                      <Form.Control
                        type="url"
                        placeholder="https:// または http://で始まるURLを入れる"
                        value={editingLinks[link.id]?.url || ''}
                        onChange={(e) => setEditingLinks(prev => ({
                          ...prev,
                          [link.id]: { ...prev[link.id], url: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <Row>
                      <Col></Col>
                      <Col xs={5}>
                        <Button
                          variant="success"
                          className="rounded-pill"
                          onClick={() => handleLinkUpdate(link.id)}
                        >
                          リンク更新
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          variant="outline-secondary"
                          className="rounded-pill"
                          onClick={() => onLinkDelete && onLinkDelete(link.id)}
                        >
                          削除
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card>
              </Collapse>
            </Col>
            <Col lg={3} xs={2}></Col>
          </Row>
        ))}
      </Row>
    </Container>
  );
};

export default AdminPage;