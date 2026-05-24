(() => {
  function getAuth() {
    return window.ProjectNeoAuth;
  }

  function getPasskeyApi() {
    return getAuth()?.getClient().auth.passkey;
  }

  function hasWebAuthnSupport() {
    return Boolean(window.PublicKeyCredential && navigator.credentials);
  }

  function hasPasskeyApi() {
    const api = getPasskeyApi();
    return Boolean(
      api &&
        typeof api.register === "function" &&
        typeof api.signIn === "function" &&
        typeof api.list === "function" &&
        typeof api.update === "function" &&
        typeof api.delete === "function",
    );
  }

  async function getSupportStatus() {
    const webAuthn = hasWebAuthnSupport();
    let platformAuthenticator = false;

    if (webAuthn && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      platformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);
    }

    return {
      webAuthn,
      platformAuthenticator,
      api: safeHasPasskeyApi(),
    };
  }

  function safeHasPasskeyApi() {
    try {
      return hasPasskeyApi();
    } catch {
      return false;
    }
  }

  async function assertAvailable() {
    const support = await getSupportStatus();
    if (!support.webAuthn) {
      throw new Error("Passkeys are not available on this browser or device.");
    }
    if (!support.api) {
      throw new Error("Supabase passkey support is not available in the loaded SDK.");
    }
    return support;
  }

  async function register(friendlyName) {
    await assertAvailable();
    const options = friendlyName ? { friendlyName } : undefined;
    return getPasskeyApi().register(options);
  }

  async function signIn() {
    await assertAvailable();
    return getPasskeyApi().signIn();
  }

  async function list() {
    await assertAvailable();
    return getPasskeyApi().list();
  }

  async function update(id, friendlyName) {
    await assertAvailable();
    return getPasskeyApi().update({ id, friendlyName });
  }

  async function remove(id) {
    await assertAvailable();
    return getPasskeyApi().delete({ id });
  }

  function normalizeList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.passkeys)) return data.passkeys;
    if (Array.isArray(data?.credentials)) return data.credentials;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  function getPasskeyId(passkey) {
    return passkey.id || passkey.credential_id || passkey.credentialId || passkey.passkey_id || "";
  }

  function getPasskeyName(passkey) {
    return passkey.friendly_name || passkey.friendlyName || passkey.name || "Passkey";
  }

  window.ProjectNeoPasskeys = Object.freeze({
    getSupportStatus,
    hasWebAuthnSupport,
    hasPasskeyApi: safeHasPasskeyApi,
    register,
    signIn,
    list,
    update,
    remove,
    normalizeList,
    getPasskeyId,
    getPasskeyName,
  });
})();
