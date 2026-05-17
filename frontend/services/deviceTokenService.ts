/**
 * Device Token Service
 * Handles registration of device tokens with the backend.
 * Called from useDeviceToken() hook.
 */

import { httpClient, API_BASE_URL } from "./httpClient";
import type { RegisterDeviceTokenRequest } from "../data/notification.d";

/**
 * Register device token with backend
 * POST /api/device/register
 */
export async function registerDeviceToken(
  token: string,
  platform: "Android" | "iOS",
): Promise<void> {
  try {
    const payload: RegisterDeviceTokenRequest = {
      token,
      platform,
    };

    const response = await httpClient.post(
      `${API_BASE_URL}/api/device/register`,
      payload,
    );

    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Failed to register device token: ${response.status}`);
    }

    if (__DEV__) {
      console.log(
        `[Device Token] Registered ${platform} token: ${token.substring(0, 20)}...`,
      );
    }
  } catch (error) {
    console.error("[Device Token] Registration failed:", error);
    throw error;
  }
}

/**
 * Optional: Revoke device token (for logout)
 * Useful if backend supports token revocation
 */
export async function revokeDeviceToken(token: string): Promise<void> {
  try {
    // This endpoint may not exist yet; implement if backend adds it
    // await httpClient.post(`${API_BASE_URL}/api/device/revoke`, { token });
    if (__DEV__) {
      console.log(
        `[Device Token] Token revoked locally: ${token.substring(0, 20)}...`,
      );
    }
  } catch (error) {
    console.warn("[Device Token] Revoke failed:", error);
  }
}
