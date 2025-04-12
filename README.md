
# Shops Digital Ads

**Shops Digital Ads** is a digital advertisement platform that connects users who own display screens with those who want to promote ads. The platform allows users to register their displays, upload ads, and manage ad campaigns. Ads approved by the admin are automatically downloaded to Android TV devices, where they are played until their expiry.

---

## 🧩 Project Structure

This project consists of the following components:

### 1. Backend
- **Technology**: Node.js with Express.js
- **Database**: MySQL
- **Functionality**:
  - User authentication and management
  - Display registration
  - Ad submission, approval, and scheduling
  - Income tracking for displays
  - Admin panel for approvals and user management
  - REST APIs for Flutter apps
- **GitHub**: [Backend Repository](https://github.com/your-username/ShopsDigitalAds-Backend)

### 2. Mobile App (Flutter)
- **Platform**: Android & iOS
- **Features**:
  - Unified user system with both display registration and ad upload features
  - Register and manage display devices
  - Upload and manage ad campaigns
  - View earnings generated from ads running on personal displays
  - Track ad status and expiry
- **GitHub**: [Mobile App Repository](https://github.com/your-username/ShopsDigitalAds-Mobile)

### 3. Android TV App (Flutter)
- **Platform**: Android TV
- **Features**:
  - Syncs and downloads approved ads for offline playback
  - Plays ads in a loop until their expiry
  - Designed for full-screen immersive ad display
- **GitHub**: [TV App Repository](https://github.com/your-username/ShopsDigitalAds-TV)

---

## 👥 User Functionality

All users on the platform can:

- Register display screens to show ads
- Upload advertisements to be shown on other users’ displays
- Earn income when ads are shown on their registered displays
- Track the income generated from ad views on their screens

> There are no strict roles like "Display Owner" or "Ads Uploader". Every user has access to all functionalities.

---

## 🔁 Workflow

1. User signs up via the **Mobile App**
2. User can:
   - Register a **Display** to host ads
   - **Upload Ads** to be played on available displays
3. Admin reviews and approves submitted ads
4. Approved ads are downloaded to the **Android TV App**
5. Ads play in a loop until the defined **expiry date**
6. Users earn based on the ads displayed on their registered screens

---

## 🔧 Technologies Used

| Layer         | Technology        |
|---------------|------------------|
| Backend       | Node.js (Express)|
| Database      | MySQL            |
| Mobile App    | Flutter          |
| TV App        | Flutter          |
| Admin Panel   | Web Interface (Upcoming) |

---

## 📦 Setup Instructions

### Backend
```bash
git clone https://github.com/your-username/ShopsDigitalAds-Backend
cd ShopsDigitalAds-Backend
npm install
# Configure your .env file
npm test
```

### Flutter Mobile App
```bash
git clone https://github.com/your-username/ShopsDigitalAds-Mobile
cd ShopsDigitalAds-Mobile
flutter pub get
flutter run
```

### Flutter Android TV App
```bash
git clone https://github.com/your-username/ShopsDigitalAds-TV
cd ShopsDigitalAds-TV
flutter pub get
flutter run
```

---



## 📧 Contact

**Shop Digital Ads**  
Developer | Shops Digital Ads  
📩 Email: [Your Email Here]

---

```