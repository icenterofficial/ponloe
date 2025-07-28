// File: functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// 1. [ថ្មី] Function ដែលដំណើរការនៅពេលមាន User ថ្មីចុះឈ្មោះ
// វាจะสร้าง Document ក្នុង Firestore ដោយស្វ័យប្រវត្តិ
exports.onUserCreate = functions.region("asia-southeast1") // កំណត់តំបន់ដើម្បីให้เร็วขึ้น
  .auth.user().onCreate(async (user) => {
    functions.logger.log("A new user signed up:", user.uid, user.email);

    // កំណត់ Role ដំបូងជា 'viewer'
    const userRole = "viewer";

    // បង្កើត Document នៅក្នុង collection 'users'
    const userDocRef = db.collection("users").doc(user.uid);
    await userDocRef.set({
      displayName: user.displayName || "New User",
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: userRole,
      disabled: false, // ស្ថានភាពដំបូងគឺ Enabled
    });

    // កំណត់ Custom Claim សម្រាប់ Role នោះ
    await admin.auth().setCustomUserClaims(user.uid, { role: userRole });

    functions.logger.log(`Successfully created user doc and set role '${userRole}' for ${user.uid}`);
    return null;
  });

// 2. [ថ្មី & សំខាន់] Function សម្រាប់ Admin ដើម្បីកែប្រែ Role
exports.setUserRole = functions.region("asia-southeast1")
  .https.onCall(async (data, context) => {
    // ពិនិត្យថាអ្នកហៅ Function នេះគឺជា Admin
    if (context.auth.token.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You must be an admin to change user roles."
      );
    }

    const { uid, newRole } = data;
    if (!uid || !["admin", "editor", "viewer"].includes(newRole)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a 'uid' and a valid 'newRole'."
      );
    }
    
    try {
      // កំណត់ Custom Claim ក្នុង Auth
      await admin.auth().setCustomUserClaims(uid, { role: newRole });
      
      // Update Role ក្នុង Firestore document ផងដែរ
      await db.collection("users").doc(uid).update({ role: newRole });

      functions.logger.log(`Successfully set role '${newRole}' for user ${uid} by admin ${context.auth.uid}`);
      return { message: `Successfully updated role to ${newRole} for user ${uid}.` };
    } catch (error) {
      functions.logger.error("Error setting user role:", error);
      throw new functions.https.HttpsError("internal", "Unable to update user role.");
    }
  });

// 3. [កែសម្រួល] Function សម្រាប់ Enable/Disable User
exports.toggleUserStatus = functions.region("asia-southeast1")
  .https.onCall(async (data, context) => {
    if (context.auth.token.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Only admins can change user status.");
    }
    const { uid, disabled } = data;
    try {
      // Update ក្នុង Firebase Auth
      await admin.auth().updateUser(uid, { disabled });
      // Update ក្នុង Firestore
      await db.collection("users").doc(uid).update({ disabled });
      return { message: `User ${uid} status updated successfully.` };
    } catch (error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

// 4. [កែសម្រួល] Function សម្រាប់លុប User
exports.deleteUser = functions.region("asia-southeast1")
  .https.onCall(async (data, context) => {
    if (context.auth.token.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Only admins can delete users.");
    }
    const { uid } = data;
    try {
      // លុបจาก Firebase Auth (จะ trigger function ด้านล่างเพื่อลบจาก Firestore)
      await admin.auth().deleteUser(uid);
      return { message: `Successfully deleted user ${uid}.` };
    } catch (error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  });

// 5. [ថ្មី] Function ដើម្បីលុប Firestore document នៅពេល User ត្រូវបានលុបจาก Auth
exports.onUserDelete = functions.region("asia-southeast1")
  .auth.user().onDelete(async (user) => {
    functions.logger.log("A user was deleted:", user.uid);
    const userDocRef = db.collection("users").doc(user.uid);
    await userDocRef.delete();
    functions.logger.log(`Successfully deleted user doc for ${user.uid}`);
    return null;
  });

// 6. [ថ្មី] Function សម្រាប់ Admin ដើម្បីទាញយក User ទាំងអស់จาก Firestore
exports.getAllUsers = functions.region("asia-southeast1")
  .https.onCall(async (data, context) => {
    // ពិនិត្យថាអ្នកហៅ Function នេះគឺជា Admin
    if (context.auth.token.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You must be an admin to view all users."
      );
    }
    
    try {
      const userDocs = await db.collection("users").orderBy("createdAt", "desc").get();
      const users = userDocs.docs.map(doc => {
        const userData = doc.data();
        // បំលែង Timestamp ទៅជា ISO string ដើម្បីให้ងាយស្រួលប្រើក្នុង JS
        return {
          uid: doc.id,
          ...userData,
          createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : null,
        };
      });
      return { users };
    } catch (error) {
      functions.logger.error("Error getting all users:", error);
      throw new functions.https.HttpsError("internal", "Unable to retrieve users.");
    }
  });
