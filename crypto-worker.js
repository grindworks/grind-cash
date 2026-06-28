self.addEventListener('message', async (e) => {
  const { id, type, data, password } = e.data;
  
  if (type === 'encrypt' || type === 'decrypt') {
    try {
      let passwordBuffer = password;
      if (typeof password === 'string') {
        const encoder = new TextEncoder();
        passwordBuffer = encoder.encode(password);
      }
      
      const importedPassword = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // Zeroization: clear the password buffer from memory
      if (passwordBuffer instanceof Uint8Array) {
        crypto.getRandomValues(passwordBuffer);
      }

      if (type === 'encrypt') {
        // Generate random salt and IV
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Derive key using PBKDF2
        const key = await crypto.subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt: salt,
            iterations: 600000,
            hash: 'SHA-256'
          },
          importedPassword,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt']
        );
        
        // Encrypt the data
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          data
        );
        
        // Combine MAGIC_BYTES + salt + iv + ciphertext
        const MAGIC_BYTES = new TextEncoder().encode('GRINDEN2');
        const encryptedData = new Uint8Array(encryptedBuffer);
        const result = new Uint8Array(MAGIC_BYTES.length + salt.length + iv.length + encryptedData.length);
        result.set(MAGIC_BYTES, 0);
        result.set(salt, MAGIC_BYTES.length);
        result.set(iv, MAGIC_BYTES.length + salt.length);
        result.set(encryptedData, MAGIC_BYTES.length + salt.length + iv.length);
        
        // Return result using transferables to prevent memory exhaustion
        self.postMessage({
          id,
          success: true,
          result
        }, [result.buffer]);
        
      } else if (type === 'decrypt') {
        let offset = 0;
        let iterations = 600000;
        
        if (data.length >= 8) {
          const magic = new TextDecoder().decode(data.slice(0, 8));
          if (magic === 'GRINDENC') {
            offset = 8;
            iterations = 100000;
          } else if (magic === 'GRINDEN2') {
            offset = 8;
            iterations = 600000;
          }
        }
        
        if (data.length < offset + 28) {
          throw new Error('Data is too short to be a valid encrypted file.');
        }
        
        // Extract salt, IV, and ciphertext
        const salt = data.slice(offset, offset + 16);
        const iv = data.slice(offset + 16, offset + 28);
        const ciphertext = data.slice(offset + 28);
        
        // Derive key using the extracted salt
        const key = await crypto.subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: 'SHA-256'
          },
          importedPassword,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        );
        
        // Decrypt the data
        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          ciphertext
        );
        
        const result = new Uint8Array(decryptedBuffer);
        // Return result using transferables to prevent memory exhaustion
        self.postMessage({
          id,
          success: true,
          result
        }, [result.buffer]);
      }
    } catch (error) {
      self.postMessage({ id, success: false, error: error.message });
    }
  }
});
