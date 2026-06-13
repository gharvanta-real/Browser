use base64::{Engine, engine::general_purpose::STANDARD};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct ProtectedSecret {
    pub scheme: SecretScheme,
    pub ciphertext_b64: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum SecretScheme {
    WindowsDpapi,
    DevObfuscation,
}

#[derive(Debug, thiserror::Error)]
pub enum CryptoError {
    #[error("secret protection failed")]
    ProtectFailed,
    #[error("secret unprotection failed")]
    UnprotectFailed,
    #[error("secret decode failed: {0}")]
    Decode(String),
}

pub fn protect_secret(plain: &str) -> Result<ProtectedSecret, CryptoError> {
    protect_bytes(plain.as_bytes())
}

pub fn reveal_secret(secret: &ProtectedSecret) -> Result<String, CryptoError> {
    let bytes = reveal_bytes(secret)?;
    String::from_utf8(bytes).map_err(|error| CryptoError::Decode(error.to_string()))
}

#[cfg(windows)]
fn protect_bytes(bytes: &[u8]) -> Result<ProtectedSecret, CryptoError> {
    use windows_sys::Win32::Foundation::LocalFree;
    use windows_sys::Win32::Security::Cryptography::{CRYPT_INTEGER_BLOB, CryptProtectData};

    let mut input = CRYPT_INTEGER_BLOB {
        cbData: bytes.len() as u32,
        pbData: bytes.as_ptr() as *mut u8,
    };
    let mut output = CRYPT_INTEGER_BLOB {
        cbData: 0,
        pbData: std::ptr::null_mut(),
    };

    let ok = unsafe {
        CryptProtectData(
            &mut input,
            std::ptr::null(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            0,
            &mut output,
        )
    };
    if ok == 0 {
        return Err(CryptoError::ProtectFailed);
    }

    let protected = unsafe { std::slice::from_raw_parts(output.pbData, output.cbData as usize) };
    let encoded = STANDARD.encode(protected);
    unsafe {
        LocalFree(output.pbData.cast());
    }

    Ok(ProtectedSecret {
        scheme: SecretScheme::WindowsDpapi,
        ciphertext_b64: encoded,
    })
}

#[cfg(windows)]
fn reveal_bytes(secret: &ProtectedSecret) -> Result<Vec<u8>, CryptoError> {
    use windows_sys::Win32::Foundation::LocalFree;
    use windows_sys::Win32::Security::Cryptography::{CRYPT_INTEGER_BLOB, CryptUnprotectData};

    if secret.scheme != SecretScheme::WindowsDpapi {
        return dev_reveal(secret);
    }

    let mut encrypted = STANDARD
        .decode(&secret.ciphertext_b64)
        .map_err(|error| CryptoError::Decode(error.to_string()))?;
    let mut input = CRYPT_INTEGER_BLOB {
        cbData: encrypted.len() as u32,
        pbData: encrypted.as_mut_ptr(),
    };
    let mut output = CRYPT_INTEGER_BLOB {
        cbData: 0,
        pbData: std::ptr::null_mut(),
    };

    let ok = unsafe {
        CryptUnprotectData(
            &mut input,
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            0,
            &mut output,
        )
    };
    if ok == 0 {
        return Err(CryptoError::UnprotectFailed);
    }

    let plain =
        unsafe { std::slice::from_raw_parts(output.pbData, output.cbData as usize) }.to_vec();
    unsafe {
        LocalFree(output.pbData.cast());
    }
    Ok(plain)
}

#[cfg(not(windows))]
fn protect_bytes(bytes: &[u8]) -> Result<ProtectedSecret, CryptoError> {
    let obfuscated = bytes.iter().map(|b| b ^ 0xA5).collect::<Vec<_>>();
    Ok(ProtectedSecret {
        scheme: SecretScheme::DevObfuscation,
        ciphertext_b64: STANDARD.encode(obfuscated),
    })
}

#[cfg(not(windows))]
fn reveal_bytes(secret: &ProtectedSecret) -> Result<Vec<u8>, CryptoError> {
    dev_reveal(secret)
}

fn dev_reveal(secret: &ProtectedSecret) -> Result<Vec<u8>, CryptoError> {
    let bytes = STANDARD
        .decode(&secret.ciphertext_b64)
        .map_err(|error| CryptoError::Decode(error.to_string()))?;
    Ok(match secret.scheme {
        SecretScheme::WindowsDpapi => bytes,
        SecretScheme::DevObfuscation => bytes.iter().map(|b| b ^ 0xA5).collect(),
    })
}

#[cfg(windows)]
pub fn verify_user_consent(message: &str) -> bool {
    use std::ptr;
    use windows_sys::Win32::Foundation::HWND;
    use windows_sys::Win32::Foundation::LocalFree;
    use windows_sys::Win32::Security::Credentials::{
        CREDUI_INFOW, CREDUIWIN_GENERIC, CredUIPromptForWindowsCredentialsW,
    };

    let mut message_u16: Vec<u16> = message.encode_utf16().collect();
    message_u16.push(0);

    let mut title_u16: Vec<u16> = "Aero Browser Security".encode_utf16().collect();
    title_u16.push(0);

    let mut ui_info = CREDUI_INFOW {
        cbSize: std::mem::size_of::<CREDUI_INFOW>() as u32,
        hwndParent: 0 as HWND,
        pszMessageText: message_u16.as_ptr(),
        pszCaptionText: title_u16.as_ptr(),
        hbmBanner: 0 as _,
    };

    let mut auth_package: u32 = 0;
    let mut out_buffer: *mut ::core::ffi::c_void = ptr::null_mut();
    let mut out_buffer_size: u32 = 0;
    let mut save: i32 = 0;

    let status = unsafe {
        CredUIPromptForWindowsCredentialsW(
            &mut ui_info,
            0,
            &mut auth_package,
            ptr::null(),
            0,
            &mut out_buffer,
            &mut out_buffer_size,
            &mut save,
            CREDUIWIN_GENERIC,
        )
    };

    if status == 0 {
        if !out_buffer.is_null() {
            unsafe {
                LocalFree(out_buffer as _);
            }
        }
        true
    } else {
        false
    }
}

#[cfg(not(windows))]
pub fn verify_user_consent(message: &str) -> bool {
    println!("Mock User Consent Requested: {}", message);
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn protects_and_reveals_secret() {
        let protected = protect_secret("sk-test").unwrap();
        assert_ne!(protected.ciphertext_b64, "sk-test");
        assert_eq!(reveal_secret(&protected).unwrap(), "sk-test");
    }
}
