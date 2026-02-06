import { sha256 } from 'js-sha256'
import * as aesjs from 'aes-js'

export class CryptoManager {
    constructor() {
        this.roomKey = null
        this.initialized = false
    }

    async init() {
        // Initialize crypto subsystem
        if (typeof crypto === 'undefined' || !crypto.subtle) {
            throw new Error('Web Crypto API not available')
        }
        this.initialized = true
    }

    async deriveRoomKey(roomName, password = '') {
        // Combine room name and password to create encryption key
        const combined = roomName + password
        const hash = sha256(combined)

        // Convert hex string to byte array (first 32 bytes for AES-256)
        this.roomKey = new Uint8Array(
            hash.match(/.{1,2}/g).slice(0, 32).map(byte => parseInt(byte, 16))
        )
    }

    async encryptMessage(plaintext) {
        if (!this.roomKey) {
            throw new Error('Room key not initialized')
        }

        // Convert text to bytes
        const textBytes = aesjs.utils.utf8.toBytes(plaintext)

        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(16))

        // AES-256-CBC encryption
        const aesCbc = new aesjs.ModeOfOperation.cbc(this.roomKey, iv)

        // Pad to block size
        const paddedBytes = this.pkcs7Pad(textBytes, 16)
        const encryptedBytes = aesCbc.encrypt(paddedBytes)

        // Combine IV + ciphertext
        const combined = new Uint8Array(iv.length + encryptedBytes.length)
        combined.set(iv)
        combined.set(encryptedBytes, iv.length)

        // Return as base64
        return this.arrayBufferToBase64(combined)
    }

    async decryptMessage(ciphertext) {
        if (!this.roomKey) {
            throw new Error('Room key not initialized')
        }

        // Decode from base64
        const combined = this.base64ToArrayBuffer(ciphertext)

        // Extract IV and ciphertext
        const iv = combined.slice(0, 16)
        const encryptedBytes = combined.slice(16)

        // AES-256-CBC decryption
        const aesCbc = new aesjs.ModeOfOperation.cbc(this.roomKey, iv)
        const decryptedBytes = aesCbc.decrypt(encryptedBytes)

        // Remove padding
        const unpaddedBytes = this.pkcs7Unpad(decryptedBytes)

        // Convert bytes to text
        return aesjs.utils.utf8.fromBytes(unpaddedBytes)
    }

    async encryptFile(arrayBuffer) {
        if (!this.roomKey) {
            throw new Error('Room key not initialized')
        }

        const data = new Uint8Array(arrayBuffer)
        const iv = crypto.getRandomValues(new Uint8Array(16))

        const aesCbc = new aesjs.ModeOfOperation.cbc(this.roomKey, iv)
        const paddedData = this.pkcs7Pad(data, 16)
        const encrypted = aesCbc.encrypt(paddedData)

        const combined = new Uint8Array(iv.length + encrypted.length)
        combined.set(iv)
        combined.set(encrypted, iv.length)

        return combined.buffer
    }

    async decryptFile(arrayBuffer) {
        if (!this.roomKey) {
            throw new Error('Room key not initialized')
        }

        const combined = new Uint8Array(arrayBuffer)
        const iv = combined.slice(0, 16)
        const encrypted = combined.slice(16)

        const aesCbc = new aesjs.ModeOfOperation.cbc(this.roomKey, iv)
        const decrypted = aesCbc.decrypt(encrypted)
        const unpadded = this.pkcs7Unpad(decrypted)

        return unpadded.buffer
    }

    pkcs7Pad(data, blockSize) {
        const padding = blockSize - (data.length % blockSize)
        const padded = new Uint8Array(data.length + padding)
        padded.set(data)
        for (let i = data.length; i < padded.length; i++) {
            padded[i] = padding
        }
        return padded
    }

    pkcs7Unpad(data) {
        const padding = data[data.length - 1]
        return data.slice(0, data.length - padding)
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary)
    }

    base64ToArrayBuffer(base64) {
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }
        return bytes
    }
}
