import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import ProfileCard from '../components/ProfileCard';

const Page = styled.main`
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(120deg, #fff1eb 0%, #ace0f9 100%);
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Right = styled.div``;

const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const AvatarOuter = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg,#F98866,#FFB88C);
  display:flex;
  align-items:center;
  justify-content:center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EditOverlay = styled.label`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(255,255,255,0.95);
  color: #F98866;
  padding: 6px 8px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
`;

const HiddenInput = styled.input`
  display:none;
`;

const NameLarge = styled.h2`
  color: #333;
  text-align:center;
`;

const RoleLabel = styled.p`
  color: #666;
  text-align:center;
  margin-top: -6px;
`;

const DetailsCard = styled.div`
  background: rgba(253, 250, 247, 0.95);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.06);
`;

const DetailsHeader = styled.div`
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:18px;
`;

const Title = styled.h3`
  margin:0;
  color:#333;
`;

const EditButton = styled.button`
  background: #F98866;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight:700;
  box-shadow: 0 6px 14px rgba(249,136,102,0.12);
  &:hover { transform: translateY(-2px); }
`;

const Row = styled.div`
  display:flex;
  gap:12px;
  margin-bottom:12px;
  flex-wrap:wrap;
`;

const Field = styled.div`
  flex:1 1 220px;
`;

const Label = styled.label`
  display:block;
  color:#666;
  margin-bottom:6px;
`;

const Input = styled.input`
  width:100%;
  padding:10px 12px;
  border-radius:8px;
  border:1px solid #e6e6e6;
  background: ${props => props.disabled ? '#f5f5f5' : 'white'};
  outline:none;
  &:focus { box-shadow: 0 0 0 4px rgba(249,136,102,0.12); border-color:#F98866; }
`;

const Select = styled.select`
  width:100%;
  padding:10px 12px;
  border-radius:8px;
  border:1px solid #e6e6e6;
  outline:none;
  &:focus { box-shadow: 0 0 0 4px rgba(249,136,102,0.12); border-color:#F98866; }
`;

const Actions = styled.div`
  display:flex;
  gap:12px;
  justify-content:flex-end;
  margin-top:18px;
`;

const Primary = styled.button`
  background:#F98866;
  color:white;
  border:none;
  padding:10px 16px;
  border-radius:10px;
  cursor:pointer;
  font-weight:700;
  box-shadow: 0 8px 18px rgba(249,136,102,0.12);
  &:hover{ transform: translateY(-2px); }
`;

const Secondary = styled.button`
  background: white;
  color:#666;
  border:1px solid #eee;
  padding:10px 16px;
  border-radius:10px;
  cursor:pointer;
`;

const Error = styled.p`
  color: #e74c3c;
`;

function ProfilePage(){
  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    college: '',
    preferredLang: 'eng_Latn',
    avatarUrl: ''
  });

  const fileRef = useRef(null);

  // Language options with their codes
  const languages = {
    "Assamese": "asm_Beng",
    "Kashmiri (Arabic)": "kas_Arab",
    "Punjabi": "pan_Guru",
    "Bengali": "ben_Beng",
    "Kashmiri (Devanagari)": "kas_Deva",
    "Sanskrit": "san_Deva",
    "Bodo": "brx_Deva",
    "Maithili": "mai_Deva",
    "Santali": "sat_Olck",
    "Dogri": "doi_Deva",
    "Malayalam": "mal_Mlym",
    "Sindhi (Arabic)": "snd_Arab",
    "English": "eng_Latn",
    "Marathi": "mar_Deva",
    "Sindhi (Devanagari)": "snd_Deva",
    "Konkani": "gom_Deva",
    "Manipuri (Bengali)": "mni_Beng",
    "Tamil": "tam_Taml",
    "Gujarati": "guj_Gujr",
    "Manipuri (Meitei)": "mni_Mtei",
    "Telugu": "tel_Telu",
    "Hindi": "hin_Deva",
    "Nepali": "npi_Deva",
    "Urdu": "urd_Arab",
    "Kannada": "kan_Knda",
    "Odia": "ory_Orya"
  };

  useEffect(()=>{
    // Load user from localStorage (fallback)
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || localStorage.getItem('userEmailAddress') || '';
    const college = localStorage.getItem('userCollege') || '';
    const role = localStorage.getItem('userRole') || '';
    const [firstName, ...rest] = (name||'').split(' ');
    const lastName = rest.join(' ');

    setForm(f => ({
      ...f,
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      college: college || '',
      preferredLang: localStorage.getItem('preferredLang') || 'eng_Latn',
      avatarUrl: localStorage.getItem('userAvatar') || ''
    }));
  },[]);

  function handleChange(e){
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleAvatarChange(e){
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, avatarUrl: url }));
    // If you want to upload, do it here (or on Save)
  }

  function validate(){
    setError('');
    if (!form.firstName) { setError('First name is required'); return false; }
    if (!form.lastName) { setError('Last name is required'); return false; }
    if (form.phone && !/^\+?[0-9\s-]{7,20}$/.test(form.phone)) { setError('Invalid phone format'); return false; }
    return true;
  }

  async function handleSave(){
    if (!validate()) return;
    setLoading(true);
    try{
      // Try to save to backend first
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('userEmailAddress');
      
      if (userEmail) {
        try {
          // Get user by email first to get the user ID
          const userResponse = await axios.get(`${API_URL}/api/users/email/${encodeURIComponent(userEmail)}`);
          const userId = userResponse.data.user.id;
          
          // Update user profile in database
          const updateData = {
            first_name: form.firstName,
            last_name: form.lastName,
            college: form.college,
            phone: form.phone,
            preferred_language: form.preferredLang
          };
          
          await axios.put(`${API_URL}/api/users/${userId}`, updateData, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } 
          });
        } catch (backendError) {
          console.warn('Backend save failed, falling back to localStorage:', backendError);
        }
      } else {
        console.warn('No user email found in localStorage');
      }

      // Persist locally as fallback/backup
      localStorage.setItem('userName', `${form.firstName} ${form.lastName}`);
      localStorage.setItem('userEmail', form.email);
      localStorage.setItem('userCollege', form.college);
      localStorage.setItem('preferredLang', form.preferredLang);
      if (form.avatarUrl) localStorage.setItem('userAvatar', form.avatarUrl);

      setMode('view');
    }catch(err){
      console.error(err);
      setError('Failed to save changes');
    }finally{
      setLoading(false);
    }
  }

  function handleCancel(){
    // reload saved values
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const college = localStorage.getItem('userCollege') || '';
    const [firstName, ...rest] = (name||'').split(' ');
    const lastName = rest.join(' ');

    setForm(f => ({
      ...f,
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      college: college || '',
      preferredLang: localStorage.getItem('preferredLang') || 'eng_Latn',
      avatarUrl: localStorage.getItem('userAvatar') || ''
    }));

    setMode('view');
  }

  return (
    <Page>
      <Container>
        <Grid>
          <Left>
            <AvatarWrapper>
              <AvatarOuter>
                {form.avatarUrl ? <AvatarImg src={form.avatarUrl} alt="avatar" /> : (
                  <span style={{color:'white', fontSize:40, fontWeight:700}}>{(form.firstName||form.email||'U').charAt(0).toUpperCase()}</span>
                )}

                <EditOverlay htmlFor="avatar-upload">✎</EditOverlay>
                <HiddenInput id="avatar-upload" type="file" accept="image/*" ref={fileRef} onChange={handleAvatarChange} />
              </AvatarOuter>

              <NameLarge>{form.firstName ? `${form.firstName} ${form.lastName}` : form.email || 'User'}</NameLarge>
              <RoleLabel>{(localStorage.getItem('userRole') || '').replace('_',' ') || 'Student'}</RoleLabel>
            </AvatarWrapper>

            {/* Also show the small ProfileCard for consistency */}
            <ProfileCard
              firstName={form.firstName}
              lastName={form.lastName}
              email={form.email}
              preferredLang={form.preferredLang}
              college={form.college}
              avatarUrl={form.avatarUrl}
            />
          </Left>

          <Right>
            <DetailsCard>
              <DetailsHeader>
                <Title>Personal Information</Title>
                {mode === 'view' ? (
                  <EditButton onClick={() => setMode('edit')}>Edit Profile</EditButton>
                ) : null}
              </DetailsHeader>

              <div>
                <Row>
                  <Field>
                    <Label>First Name</Label>
                    {mode === 'view' ? <div>{form.firstName}</div> : <Input name="firstName" value={form.firstName} onChange={handleChange} />}
                  </Field>

                  <Field>
                    <Label>Last Name</Label>
                    {mode === 'view' ? <div>{form.lastName}</div> : <Input name="lastName" value={form.lastName} onChange={handleChange} />}
                  </Field>
                </Row>

                <Row>
                  <Field>
                    <Label>Email</Label>
                    <Input name="email" value={form.email} disabled />
                  </Field>

                  <Field>
                    <Label>Phone Number</Label>
                    {mode === 'view' ? <div>{form.phone || '—'}</div> : <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />}
                  </Field>
                </Row>

                <Row>
                  <Field style={{flex:'1 1 100%'}}>
                    <Label>College</Label>
                    {mode === 'view' ? <div>{form.college || '—'}</div> : <Input name="college" value={form.college} onChange={handleChange} />}
                  </Field>
                </Row>

                <Row>
                  <Field>
                    <Label>Preferred Language</Label>
                    {mode === 'view' ? (
                      <div>{Object.keys(languages).find(key => languages[key] === form.preferredLang) || 'English'}</div>
                    ) : (
                      <Select name="preferredLang" value={form.preferredLang} onChange={handleChange}>
                        {Object.entries(languages).map(([languageName, languageCode]) => (
                          <option key={languageCode} value={languageCode}>
                            {languageName}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </Row>

                {error && <Error>{error}</Error>}

                {mode === 'edit' && (
                  <Actions>
                    <Secondary onClick={handleCancel}>Cancel</Secondary>
                    <Primary onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Primary>
                  </Actions>
                )}
              </div>
            </DetailsCard>
          </Right>
        </Grid>
      </Container>
    </Page>
  );
}

export default ProfilePage;
