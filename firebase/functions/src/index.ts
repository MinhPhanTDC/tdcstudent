import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function: Set Custom Claims when user is created
 * 
 * This function automatically sets custom claims based on the user document in Firestore.
 * Triggered when a new user document is created in the 'users' collection.
 * 
 * Benefits:
 * - No Firestore reads in Storage Rules (faster, cheaper)
 * - Claims are cached in the user's token
 * - Automatic setup for new users
 */
export const setUserClaims = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();

    try {
      // Set custom claims based on user role
      await admin.auth().setCustomUserClaims(userId, {
        role: userData.role || 'student',
        isActive: userData.isActive !== false,
      });

      console.log(`Custom claims set for user ${userId}: role=${userData.role}`);

      // Update user document to indicate claims are set
      await snap.ref.update({
        claimsSet: true,
        claimsSetAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error(`Error setting custom claims for user ${userId}:`, error);
      return { success: false, error };
    }
  });

/**
 * Cloud Function: Update Custom Claims when user role changes
 * 
 * Triggered when a user document is updated in the 'users' collection.
 * Only updates claims if the role or isActive field changes.
 */
export const updateUserClaims = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if role or isActive changed
    const roleChanged = beforeData.role !== afterData.role;
    const activeChanged = beforeData.isActive !== afterData.isActive;

    if (!roleChanged && !activeChanged) {
      console.log(`No claim changes needed for user ${userId}`);
      return { success: true, message: 'No changes' };
    }

    try {
      // Update custom claims
      await admin.auth().setCustomUserClaims(userId, {
        role: afterData.role || 'student',
        isActive: afterData.isActive !== false,
      });

      console.log(`Custom claims updated for user ${userId}: role=${afterData.role}, isActive=${afterData.isActive}`);

      // Update user document
      await change.after.ref.update({
        claimsSet: true,
        claimsSetAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error(`Error updating custom claims for user ${userId}:`, error);
      return { success: false, error };
    }
  });

/**
 * Callable Function: Force refresh custom claims for a user
 * 
 * Can be called from the client to manually refresh claims.
 * Useful after role changes or for troubleshooting.
 * 
 * Usage from client:
 * const refreshClaims = httpsCallable(functions, 'refreshUserClaims');
 * await refreshClaims({ userId: 'xxx' });
 */
export const refreshUserClaims = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = data.userId || context.auth.uid;

  // Only admins can refresh other users' claims
  if (userId !== context.auth.uid && context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can refresh other users claims');
  }

  try {
    // Get user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data()!;

    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, {
      role: userData.role || 'student',
      isActive: userData.isActive !== false,
    });

    // Update user document
    await userDoc.ref.update({
      claimsSet: true,
      claimsSetAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Claims refreshed successfully',
      claims: {
        role: userData.role,
        isActive: userData.isActive,
      },
    };
  } catch (error) {
    console.error(`Error refreshing claims for user ${userId}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to refresh claims');
  }
});
