// src/utils/fetchUserIds.ts
import { firebaseRepository } from '../lib/FirebaseRepository';

export async function fetchAllUserIds(): Promise<string[]> {
  try {
    const allUsers = await firebaseRepository.getAllUsers();
    if (!allUsers) {
      console.log('No users found in Firebase');
      return [];
    }

    const userIds = Object.keys(allUsers);
    console.log('Available User IDs:', userIds);
    return userIds;
  } catch (error) {
    console.error('Error fetching user IDs:', error);
    return [];
  }
}

export async function displayUserPreview(userId: string): Promise<void> {
  try {
    console.log(`\n=== USER: ${userId} ===`);
    
    // Get user data
    const user = await firebaseRepository.getUser(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    // Get chat sessions
    const chatSessions = await firebaseRepository.getUserChatsSorted(userId, undefined, 5);
    console.log(`Chat Sessions: ${chatSessions.length}`);
    
    if (chatSessions.length > 0) {
      console.log('Recent Sessions:');
      chatSessions.forEach(({ sessionId, lastMessage }, index) => {
        console.log(`  ${index + 1}. ${sessionId}`);
        if (lastMessage) {
          console.log(`     Last Query: ${lastMessage.query_user.substring(0, 60)}...`);
          console.log(`     Timestamp: ${new Date(lastMessage.timestamps).toLocaleString()}`);
        }
      });
    }

    // Get financial summary
    try {
      const financialSummary = await firebaseRepository.getUserFinancialSummary(userId);
      if (financialSummary) {
        console.log('Financial Data: Available');
        if (financialSummary.netWorthResponse?.totalNetWorthValue) {
          console.log(`  Net Worth: ${financialSummary.netWorthResponse.totalNetWorthValue.currencyCode} ${financialSummary.netWorthResponse.totalNetWorthValue.units}`);
        }
        if (financialSummary.mfSchemeAnalytics?.schemeAnalytics) {
          console.log(`  Mutual Funds: ${financialSummary.mfSchemeAnalytics.schemeAnalytics.length} schemes`);
        }
      } else {
        console.log('Financial Data: Not available');
      }
    } catch (error) {
      console.log('Financial Data: Error fetching');
    }

    console.log('================\n');
  } catch (error) {
    console.error(`Error displaying user preview for ${userId}:`, error);
  }
}

// Function to run in browser console
export async function exploreFirebaseData(): Promise<void> {
  console.log('🔥 Firebase Data Explorer Started...\n');
  
  const userIds = await fetchAllUserIds();
  
  if (userIds.length === 0) {
    console.log('No users found in Firebase database');
    return;
  }

  console.log(`Found ${userIds.length} users in Firebase:`);
  console.log(userIds.map((id, index) => `${index + 1}. ${id}`).join('\n'));
  console.log('\n');

  // Show preview for first 3 users
  const previewCount = Math.min(3, userIds.length);
  console.log(`Showing preview for first ${previewCount} users:\n`);
  
  for (let i = 0; i < previewCount; i++) {
    await displayUserPreview(userIds[i]);
  }

  console.log('🎉 Exploration complete!');
  console.log(`\nTo explore a specific user, use:`);
  console.log(`displayUserPreview('USER_ID')`);
  console.log(`\nAvailable user IDs: ${userIds.join(', ')}`);
}

// Make functions available globally in browser
if (typeof window !== 'undefined') {
  (window as any).exploreFirebaseData = exploreFirebaseData;
  (window as any).displayUserPreview = displayUserPreview;
  (window as any).fetchAllUserIds = fetchAllUserIds;
}
